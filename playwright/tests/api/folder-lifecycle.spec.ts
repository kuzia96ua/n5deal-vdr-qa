import { test, expect } from '../../src/fixtures/vdr.fixture';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { TEST_USERS, VALIDATION_MESSAGES } from '../../src/data';

test.describe('API Functional: Folder Lifecycle & Collision Validation', () => {
  let roomId = '';

  let foldersToCleanup: string[] = [];

  test.beforeEach(async ({ apiClient }) => {
    const loginRes = await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    expect(loginRes.status()).toBe(200);

    const roomsRes = await apiClient.getDataRooms();
    const rooms = await roomsRes.json();
    roomId = rooms.items[0].id;
    foldersToCleanup = [];
  });

  test.afterEach(async ({ apiClient }) => {
    for (const folderId of foldersToCleanup) {
      await apiClient.deleteFolder(folderId).catch(() => undefined);
    }
    foldersToCleanup = [];
  });

  test('FNC-01: Should create, rename, preview deletion, and cascade delete a folder', async ({ apiClient }) => {
    const folderName = GeneratorHelper.getUniqueFolderName('M&A_Audit');
    const updatedName = `${folderName}_Renamed`;
    let folderId = '';

    await test.step('Create a new folder at room root', async () => {
      const res = await apiClient.createFolder(roomId, folderName);
      expect(res.status()).toBe(201);
      const data = await res.json();
      folderId = data.id;
      foldersToCleanup.push(folderId);
      expect(data.name).toBe(folderName);
    });

    await test.step('Rename the created folder', async () => {
      const renameRes = await apiClient.renameFolder(folderId, updatedName);
      expect(renameRes.status()).toBe(200);
      const renameData = await renameRes.json();
      expect(renameData.name).toBe(updatedName);
    });

    await test.step('Get delete preview for the folder', async () => {
      const previewRes = await apiClient.getDeletePreview(folderId);
      expect(previewRes.status()).toBe(200);
      const preview = await previewRes.json();
      expect(preview).toHaveProperty('folderCount');
      expect(preview).toHaveProperty('fileCount');
      expect(preview).toHaveProperty('totalSize');
    });

    await test.step('Delete the folder', async () => {
      const deleteRes = await apiClient.deleteFolder(folderId);
      expect(deleteRes.status()).toBe(204);
    });

    await test.step('Verify deleted folder is no longer accessible', async () => {
      const previewAfter = await apiClient.getDeletePreview(folderId);
      expect(previewAfter.status()).toBe(404);
    });
  });

  test('FNC-02: Should reject duplicate folder names ignoring case (409 Conflict)', async ({ apiClient }) => {
    const baseName = GeneratorHelper.getUniqueFolderName('CaseTest');

    await test.step('Create original folder in lowercase', async () => {
      const res = await apiClient.createFolder(roomId, baseName.toLowerCase());
      expect(res.status()).toBe(201);
      const data = await res.json();
      foldersToCleanup.push(data.id);
    });

    await test.step('Attempt to create duplicate folder in uppercase in same directory', async () => {
      const dupRes = await apiClient.createFolder(roomId, baseName.toUpperCase());
      expect(dupRes.status()).toBe(409);
      const errorBody = await dupRes.json();
      expect(errorBody.message).toContain(VALIDATION_MESSAGES.DUPLICATE_FOLDER);
    });
  });
});
