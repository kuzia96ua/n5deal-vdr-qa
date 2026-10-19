import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { test, expect } from '../../src/fixtures/vdr.fixture';
import { TEST_USERS, UI_MESSAGES } from '../../src/data';
import { GeneratorHelper } from '../../src/helpers/generator-helper';
import { VdrItem } from '../../src/api/vdr-api';

test.describe('E2E UI: PDF File Upload & Management Flow', () => {
  // Відносне посилання на шаблонний PDF-файл із директорії src/data:
  const sourcePdfPath = path.resolve(__dirname, '../../src/data/sample.pdf');
  let uniqueFileName = '';
  let tempFilePath = '';
  let uploadedFileId = '';

  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test.afterEach(async ({ apiClient }) => {
    // 1. Прибираємо локальний тимчасовий файл
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        // ігноруємо помилки локального видалення
      }
    }

    // 2. Страхувальний API cleanup на сервері, якщо UI-видалення не пройшло
    if (uploadedFileId) {
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      await apiClient.deleteFile(uploadedFileId).catch(() => undefined);
      uploadedFileId = '';
    }
  });

  test('UI-FILE-01: Should upload a sample PDF via relative path, verify upload completion and delete it via UI', async ({
    page,
    dataRoomPage,
    deleteConfirmModal,
    apiClient,
  }) => {
    uniqueFileName = GeneratorHelper.getUniqueFileName('sample_upload');
    tempFilePath = path.join(os.tmpdir(), uniqueFileName);
    fs.copyFileSync(sourcePdfPath, tempFilePath);

    await test.step('Upload sample PDF file using relative path reference', async () => {
      await dataRoomPage.uploadFile(tempFilePath);
      // Очікуємо завершення завантаження у панелі UploadPanel
      await expect(page.getByText(UI_MESSAGES.UPLOADS_COMPLETE)).toBeVisible({ timeout: 20000 });
    });

    await test.step('Verify uploaded PDF appears in the Data Room listing', async () => {
      // Знаходимо саме наш унікальний завантажений файл без ризику колізії з чужими файлами
      const fileRow = dataRoomPage.getItemRow(uniqueFileName);
      await expect(fileRow).toBeVisible({ timeout: 10000 });

      // Отримуємо ID файлу для гарантованого cleanup у разі аварії на наступних кроках
      await apiClient.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      const rooms = await (await apiClient.getDataRooms()).json();
      const roomId = rooms.items[0].id;
      const contents = await (await apiClient.getRoomContents(roomId)).json();
      const fileItem = (contents.items as VdrItem[]).find((i) => i.name === uniqueFileName);
      if (fileItem) {
        uploadedFileId = fileItem.id;
      }
    });

    await test.step('Delete the uploaded PDF via UI actions menu', async () => {
      await dataRoomPage.openItemActions(uniqueFileName);
      await page.getByRole('menuitem', { name: 'Delete' }).click();
      await expect(deleteConfirmModal.modalDialog).toBeVisible();

      await deleteConfirmModal.confirm();
      await expect(deleteConfirmModal.modalDialog).toBeHidden();
      await expect(dataRoomPage.getToast(`"${uniqueFileName}" deleted`)).toBeVisible();
      await expect(dataRoomPage.getItemRow(uniqueFileName)).toBeHidden({ timeout: 10000 });
      uploadedFileId = ''; // успішно видалено через інтерфейс
    });
  });
});
