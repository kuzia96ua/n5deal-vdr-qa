import { Page, Locator } from '@playwright/test';

export class RenameFolderModal {
  readonly page: Page;
  readonly modalDialog: Locator;
  readonly folderNameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalDialog = page.getByRole('dialog', { name: 'Rename folder' });
    this.folderNameInput = this.modalDialog.getByRole('textbox', { name: 'Folder name' });
    this.saveButton = this.modalDialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.modalDialog.getByRole('button', { name: 'Cancel' });
  }

  async rename(newName: string): Promise<void> {
    await this.folderNameInput.fill(newName);
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
