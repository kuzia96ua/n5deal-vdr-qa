import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS } from '../../src/data';

test.describe('API Security: Sharing Lifecycle & Revocation State Machine', () => {
  let roomId = '';
  let folderId = '';

  test.beforeEach(async ({ apiClient }) => {
    const loginRes = await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    expect(loginRes.status()).toBe(200);

    const roomsRes = await apiClient.getDataRooms();
    const rooms = await roomsRes.json();
    roomId = rooms.items[0].id;

    const folderRes = await apiClient.createFolder(roomId, GeneratorHelper.getUniqueFolderName('ShareFolder'));
    const folder = await folderRes.json();
    folderId = folder.id;
  });

  test.afterEach(async ({ apiClient }) => {
    if (folderId) {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      await apiClient.deleteFolder(folderId).catch(() => undefined);
    }
  });

  test('SEC-03: Should generate public share link, allow access, and return 410 Gone after revocation', async ({ apiClient }) => {
    let shareToken = '';
    let shareId = '';

    await test.step('Generate a public share link for the folder', async () => {
      const shareRes = await apiClient.createShare('FOLDER', folderId, 'PUBLIC_LINK');
      expect(shareRes.status()).toBe(201);
      const shareData = await shareRes.json();
      shareToken = shareData.token;
      shareId = shareData.id;
      expect(shareToken).toBeTruthy();
      expect(shareId).toBeTruthy();
    });

    await test.step('Access public share without authentication', async () => {
      const publicRes = await apiClient.getPublicShare(shareToken);
      expect(publicRes.status()).toBe(200);
      const publicData = await publicRes.json();
      expect(publicData.resourceId).toBe(folderId);
      expect(publicData.resourceType).toBe('FOLDER');
    });

    await test.step('Prevent another user (Viewer) from revoking John share (IDOR)', async () => {
      await apiClient.login(TEST_USERS.VIEWER.email, TEST_USERS.VIEWER.pass);
      const unauthorizedRevoke = await apiClient.revokeShare(shareId);
      expect(unauthorizedRevoke.status()).toBe(404);
    });

    await test.step('Revoke the public share as Owner (John)', async () => {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      const revokeRes = await apiClient.revokeShare(shareId);
      expect(revokeRes.status()).toBe(204);
    });

    await test.step('Verify revoked share returns 410 Gone', async () => {
      const revokedRes = await apiClient.getPublicShare(shareToken);
      expect(revokedRes.status()).toBe(410);
      const errorBody = await revokedRes.json();
      expect(errorBody.statusCode).toBe(410);
    });
  });
});
