import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS, VALIDATION_MESSAGES } from '../../src/data';

test.describe('API Security: Authentication & Tenant Data Isolation', () => {
  test('SEC-01: Should prevent cross-tenant access to another user data room (IDOR Protection)', async ({ apiClient }) => {
    let johnRoomId = '';

    await test.step('Authenticate as John (Owner)', async () => {
      const loginRes = await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      expect(loginRes.status()).toBe(200);

      const roomsRes = await apiClient.getDataRooms();
      expect(roomsRes.status()).toBe(200);
      const roomsData = await roomsRes.json();
      johnRoomId = roomsData.items[0].id;
      expect(johnRoomId).toBeTruthy();
    });

    await test.step('Authenticate as Viewer (External Tenant)', async () => {
      const viewerLogin = await apiClient.login(TEST_USERS.VIEWER.email, TEST_USERS.VIEWER.pass);
      expect(viewerLogin.status()).toBe(200);
    });

    await test.step('Verify Viewer receives 404 when directly requesting John room contents', async () => {
      const forbiddenRes = await apiClient.getRoomContents(johnRoomId);
      expect(forbiddenRes.status()).toBe(404);
      const body = await forbiddenRes.json();
      expect(body.message).toBe(VALIDATION_MESSAGES.RESOURCE_NOT_FOUND);
    });

    await test.step('Verify Viewer cannot create folder inside John room', async () => {
      const hackFolderRes = await apiClient.createFolder(johnRoomId, 'UnauthorizedFolder');
      expect(hackFolderRes.status()).toBe(404);
    });
  });

  test('SEC-02: Should validate registration input constraints', async ({ apiClient }) => {
    await test.step('Reject invalid email format', async () => {
      const res = await apiClient.register(TEST_USERS.INVALID.malformedEmail, 'validpass123', 'Tester');
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.message).toContain(VALIDATION_MESSAGES.INVALID_EMAIL);
    });

    await test.step('Reject password shorter than 8 characters', async () => {
      const uniqueEmail = GeneratorHelper.getUniqueEmail();
      const res = await apiClient.register(uniqueEmail, TEST_USERS.INVALID.shortPassword, 'Tester');
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.message).toContain(VALIDATION_MESSAGES.SHORT_PASSWORD);
    });
  });

  test('SEC-04: Should enforce 401 Unauthorized for unauthenticated requests and forged Bearer tokens', async ({ apiClient }) => {
    await test.step('Reject request to data rooms when no token is provided', async () => {
      apiClient.clearToken();
      const res = await apiClient.getDataRooms();
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.message).toContain('Unauthorized');
    });

    await test.step('Reject folder creation when no token is provided', async () => {
      apiClient.clearToken();
      const res = await apiClient.createFolder('00000000-0000-0000-0000-000000000000', 'NoAuthFolder');
      expect(res.status()).toBe(401);
    });

    await test.step('Reject request when tampered / invalid JWT Bearer token is provided', async () => {
      apiClient.setToken('invalid.tampered.jwt.signature');
      const res = await apiClient.getDataRooms();
      expect(res.status()).toBe(401);
    });
  });
});
