import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS } from '../../src/data';

test.describe('E2E UI: Public Link Share & Unauthenticated Access', () => {
  let roomId = '';
  let folderId = '';
  let shareToken = '';
  let shareId = '';
  const folderName = GeneratorHelper.getUniqueFolderName('PublicShare_UI');

  test.beforeEach(async ({ apiClient }) => {
    await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    const rooms = await (await apiClient.getDataRooms()).json();
    roomId = rooms.items[0].id;

    const folder = await (await apiClient.createFolder(roomId, folderName)).json();
    folderId = folder.id;

    const share = await (await apiClient.createShare('FOLDER', folderId, 'PUBLIC_LINK')).json();
    shareToken = share.token;
    shareId = share.id;
  });

  test.afterEach(async ({ apiClient }) => {
    await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    if (shareId) {
      await apiClient.revokeShare(shareId).catch(() => undefined);
    }
    if (folderId) {
      await apiClient.deleteFolder(folderId).catch(() => undefined);
    }
  });

  test('UI-SHARE-01: Should access shared folder unauthenticated and display 410 on revocation', async ({ page, publicSharePage, apiClient }) => {
    await test.step('Open public share link without being logged in', async () => {
      await publicSharePage.goto(shareToken);
      await expect(page.getByText(folderName)).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: 'Sign out' })).toBeHidden();
    });

    await test.step('Revoke the public share link via API', async () => {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      const revokeRes = await apiClient.revokeShare(shareId);
      expect(revokeRes.status()).toBe(204);
    });

    await test.step('Reload public share page and verify revocation state', async () => {
      await page.reload();
      await expect(publicSharePage.revokedAlert).toBeVisible({ timeout: 10000 });
    });
  });
});
