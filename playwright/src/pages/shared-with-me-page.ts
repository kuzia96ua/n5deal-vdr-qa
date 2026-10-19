import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class SharedWithMePage extends BasePage {
  readonly pageHeading: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Shared with me' });
    this.emptyState = page.getByText('Nothing has been shared with you yet');
  }

  async goto(): Promise<void> {
    await this.page.goto('/shared-with-me');
  }

  getSharedItem(name: string): Locator {
    return this.page.locator('div[role="link"]').filter({ hasText: name }).first();
  }

  async openSharedItem(name: string): Promise<void> {
    await this.getSharedItem(name).click();
  }
}
