import { Page, Locator } from '@playwright/test';

export class ShareModal {
  readonly page: Page;
  readonly modalDialog: Locator;
  readonly createPublicLinkButton: Locator;
  readonly copyPublicLinkButton: Locator;
  readonly revokePublicLinkButton: Locator;
  readonly publicLinkInput: Locator;
  readonly emailInput: Locator;
  readonly shareButton: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalDialog = page.getByRole('dialog', { name: /Share/i });
    this.createPublicLinkButton = this.modalDialog.getByRole('button', { name: 'Create public link' });
    this.copyPublicLinkButton = this.modalDialog.getByRole('button', { name: 'Copy' });
    this.revokePublicLinkButton = this.modalDialog.getByRole('button', { name: 'Revoke public link' });
    this.publicLinkInput = this.modalDialog.locator('input[readonly]');
    this.emailInput = this.modalDialog.getByRole('textbox', { name: 'Email' });
    this.shareButton = this.modalDialog.getByRole('button', { name: 'Share' });
    this.doneButton = this.modalDialog.getByRole('button', { name: 'Done' });
  }

  async shareWithEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.shareButton.click();
  }

  async revokeAccessForUser(email: string): Promise<void> {
    const userRow = this.modalDialog.locator('li').filter({ hasText: email });
    await userRow.getByRole('button', { name: 'Revoke' }).click();
  }

  async close(): Promise<void> {
    await this.doneButton.click();
  }
}
