import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DataRoomPage } from '../pages/data-room-page';
import { SharedWithMePage } from '../pages/shared-with-me-page';
import { PublicSharePage } from '../pages/public-share-page';
import { NewFolderModal } from '../pages/modals/new-folder-modal';
import { RenameFolderModal } from '../pages/modals/rename-folder-modal';
import { DeleteConfirmModal } from '../pages/modals/delete-modal';
import { ShareModal } from '../pages/modals/share-modal';
import { VdrApiClient } from '../api/vdr-api';

export type VdrFixtures = {
  loginPage: LoginPage;
  dataRoomPage: DataRoomPage;
  sharedWithMePage: SharedWithMePage;
  publicSharePage: PublicSharePage;
  newFolderModal: NewFolderModal;
  renameFolderModal: RenameFolderModal;
  deleteConfirmModal: DeleteConfirmModal;
  shareModal: ShareModal;
  apiClient: VdrApiClient;
};

export const test = base.extend<VdrFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dataRoomPage: async ({ page }, use) => {
    await use(new DataRoomPage(page));
  },
  sharedWithMePage: async ({ page }, use) => {
    await use(new SharedWithMePage(page));
  },
  publicSharePage: async ({ page }, use) => {
    await use(new PublicSharePage(page));
  },
  newFolderModal: async ({ page }, use) => {
    await use(new NewFolderModal(page));
  },
  renameFolderModal: async ({ page }, use) => {
    await use(new RenameFolderModal(page));
  },
  deleteConfirmModal: async ({ page }, use) => {
    await use(new DeleteConfirmModal(page));
  },
  shareModal: async ({ page }, use) => {
    await use(new ShareModal(page));
  },
  apiClient: async ({ request }, use) => {
    await use(new VdrApiClient(request));
  },
});

export { expect };
