import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS } from '../../src/data';
import { LoginPage } from '../../src/pages/login-page';
import { SharedWithMePage } from '../../src/pages/shared-with-me-page';

test.describe('E2E UI: Permissioned User-to-User Sharing Flow', () => {
  let createdFolderId = '';
  let folderName = '';

  test.beforeEach(async ({ apiClient }) => {
    // Створюємо ізольовану папку для шерінгу через API під Owner
    await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    const rooms = await (await apiClient.getDataRooms()).json();
    const roomId = rooms.items[0].id;
    folderName = GeneratorHelper.getUniqueFolderName('Share_Target');
    const folderRes = await apiClient.createFolder(roomId, folderName);
    const folder = await folderRes.json();
    createdFolderId = folder.id;
  });

  test.afterEach(async ({ apiClient }) => {
    if (createdFolderId) {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      await apiClient.deleteFolder(createdFolderId).catch(() => undefined);
      createdFolderId = '';
    }
  });

  test('UI-SHARE-02: Should share folder with specific user by email via Share Modal and verify access on recipient side', async ({
    browser,
    page,
    loginPage,
    dataRoomPage,
    shareModal,
  }) => {
    // --- 1. John (Owner) ділиться папкою з Viewer через інтерфейс ---
    await test.step('Owner logs in and opens Share Modal for the folder', async () => {
      await loginPage.goto();
      await loginPage.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      await page.waitForURL('**/', { timeout: 10000 });

      await dataRoomPage.openItemActions(folderName);
      await page.getByRole('menuitem', { name: 'Share' }).click();
      await expect(shareModal.modalDialog).toBeVisible();
    });

    await test.step('Grant access to Viewer by email and verify toast', async () => {
      await shareModal.shareWithEmail(TEST_USERS.VIEWER.email);
      await expect(dataRoomPage.getToast(`Shared with ${TEST_USERS.VIEWER.email}`)).toBeVisible();
      await shareModal.close();
      await expect(shareModal.modalDialog).toBeHidden();
    });

    // --- 2. Viewer (Recipient) в окремому браузерному контексті відкриває "Shared with me" ---
    const viewerContext = await browser.newContext();
    const viewerPage = await viewerContext.newPage();
    const viewerLoginPage = new LoginPage(viewerPage);
    const viewerSharedPage = new SharedWithMePage(viewerPage);

    try {
      await test.step('Recipient logs in and navigates to "Shared with me"', async () => {
        await viewerLoginPage.goto();
        await viewerLoginPage.login(TEST_USERS.VIEWER.email, TEST_USERS.VIEWER.pass);
        await viewerPage.waitForURL('**/', { timeout: 10000 });

        await viewerSharedPage.goto();
        await expect(viewerSharedPage.pageHeading).toBeVisible();
      });

      await test.step('Verify shared folder is displayed in Recipient list', async () => {
        const sharedItem = viewerSharedPage.getSharedItem(folderName);
        await expect(sharedItem).toBeVisible({ timeout: 10000 });
      });

      // --- 3. John відкликає доступ у Viewer ---
      await test.step('Owner revokes access for Viewer via Share Modal', async () => {
        await dataRoomPage.openItemActions(folderName);
        await page.getByRole('menuitem', { name: 'Share' }).click();
        await expect(shareModal.modalDialog).toBeVisible();

        await shareModal.revokeAccessForUser(TEST_USERS.VIEWER.email);
        await expect(dataRoomPage.getToast(`Access revoked for ${TEST_USERS.VIEWER.email}`)).toBeVisible();
        await shareModal.close();
      });

      // --- 4. Viewer оновлює сторінку і перевіряє, що доступ закрито ---
      await test.step('Recipient reloads page and verifies folder is no longer accessible', async () => {
        await viewerPage.reload();
        await expect(viewerSharedPage.getSharedItem(folderName)).toBeHidden({ timeout: 10000 });
      });
    } finally {
      await viewerContext.close();
    }
  });
});
