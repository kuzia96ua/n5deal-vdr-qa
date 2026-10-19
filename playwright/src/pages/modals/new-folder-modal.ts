import { Page, Locator } from '@playwright/test';
import { VALIDATION_MESSAGES } from '../../data';

export class NewFolderModal {
  readonly page: Page;
  readonly modalDialog: Locator;
  readonly folderNameInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly validationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalDialog = page.getByRole('dialog', { name: 'New folder' });
    this.folderNameInput = this.modalDialog.getByRole('textbox', { name: 'Folder name' });
    this.createButton = this.modalDialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.modalDialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.modalDialog.getByRole('button', { name: 'Close' });
    this.validationMessage = this.modalDialog.getByText(VALIDATION_MESSAGES.EMPTY_FOLDER_NAME);
  }

  async createFolder(name: string): Promise<void> {
    await this.folderNameInput.fill(name);
    await this.createButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
