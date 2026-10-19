import { Page, Locator } from '@playwright/test';

export class DeleteConfirmModal {
  readonly page: Page;
  readonly modalDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalDialog = page.getByRole('dialog', { name: /Delete|Are you sure/i });
    this.confirmDeleteButton = this.modalDialog.getByRole('button', { name: /Delete/i });
    this.cancelButton = this.modalDialog.getByRole('button', { name: /Cancel/i });
  }

  async confirm(): Promise<void> {
    await this.confirmDeleteButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
