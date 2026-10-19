import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS, TOAST_MESSAGES } from '../../src/data';
import { VdrItem } from '../../src/api/vdr-api';

test.describe('E2E UI: Folder Management & Lifecycle Flows', () => {
  let folderNameToCleanup = '';

  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test.afterEach(async ({ apiClient }) => {
    if (folderNameToCleanup) {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      const roomsRes = await apiClient.getDataRooms();
      const rooms = await roomsRes.json();
      const roomId = rooms.items[0].id;
      const contentsRes = await apiClient.getRoomContents(roomId);
      const contents = await contentsRes.json();
      const target = (contents.items as VdrItem[]).find((i) => i.name === folderNameToCleanup);
      if (target) {
        await apiClient.deleteFolder(target.id).catch(() => undefined);
      }
      folderNameToCleanup = '';
    }
  });

  test('UI-FOLD-01: Should create, rename, and delete a folder via UI with notifications', async ({
    page,
    dataRoomPage,
    newFolderModal,
    renameFolderModal,
    deleteConfirmModal,
  }) => {
    const originalFolder = GeneratorHelper.getUniqueFolderName('E2E_Test');
    const renamedFolder = `${originalFolder}_Renamed`;
    folderNameToCleanup = originalFolder;

    await test.step('Open New Folder modal and verify empty validation', async () => {
      await dataRoomPage.clickNewFolder();
      await expect(newFolderModal.modalDialog).toBeVisible();
      await newFolderModal.createButton.click();
      await expect(newFolderModal.validationMessage).toBeVisible();
    });

    await test.step('Create a new folder via modal', async () => {
      await newFolderModal.createFolder(originalFolder);
      await expect(newFolderModal.modalDialog).toBeHidden();
      await expect(dataRoomPage.getToast(TOAST_MESSAGES.FOLDER_CREATED)).toBeVisible();
      await expect(page.getByText(originalFolder, { exact: true })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Rename the folder via row action menu', async () => {
      folderNameToCleanup = renamedFolder;
      await dataRoomPage.openItemActions(originalFolder);
      await page.getByRole('menuitem', { name: 'Rename' }).click();
      await expect(renameFolderModal.modalDialog).toBeVisible();

      await renameFolderModal.rename(renamedFolder);
      await expect(renameFolderModal.modalDialog).toBeHidden();
      await expect(dataRoomPage.getToast(TOAST_MESSAGES.FOLDER_RENAMED)).toBeVisible();
      await expect(page.getByText(renamedFolder, { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(originalFolder, { exact: true })).toBeHidden();
    });

    await test.step('Delete the renamed folder via confirmation dialog', async () => {
      await dataRoomPage.openItemActions(renamedFolder);
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(deleteConfirmModal.modalDialog).toBeVisible();

      await deleteConfirmModal.confirm();
      await expect(deleteConfirmModal.modalDialog).toBeHidden();
      await expect(dataRoomPage.getToast(new RegExp(`"${renamedFolder}" deleted`))).toBeVisible();
      await expect(page.getByText(renamedFolder, { exact: true })).toBeHidden({ timeout: 10000 });
      folderNameToCleanup = '';
    });
  });
});
