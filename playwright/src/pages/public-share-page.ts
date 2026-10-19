import { Page, Locator } from '@playwright/test';

export class PublicSharePage {
  readonly page: Page;
  readonly breadcrumbNav: Locator;
  readonly revokedAlert: Locator;
  readonly notFoundAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.breadcrumbNav = page.getByRole('navigation', { name: 'Breadcrumb' });
    this.revokedAlert = page.getByText('This link has been revoked', { exact: true });
    this.notFoundAlert = page.getByText(/not found|404/i).first();
  }

  async goto(token: string): Promise<void> {
    await this.page.goto(`/share/${token}`);
  }
}
