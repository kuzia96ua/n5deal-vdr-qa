import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly logoLink: Locator;
  readonly myDataRoomsLink: Locator;
  readonly sharedWithMeLink: Locator;
  readonly userProfileLabel: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoLink = page.getByRole('link', { name: 'Data Room' });
    this.myDataRoomsLink = page.getByRole('link', { name: 'My data rooms' });
    this.sharedWithMeLink = page.getByRole('link', { name: 'Shared with me' });
    this.userProfileLabel = page.getByRole('banner').locator('span').first();
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }

  getToast(message: string | RegExp): Locator {
    return this.page.getByRole('region', { name: /notifications/i }).getByText(message);
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  async openMyDataRooms(): Promise<void> {
    await this.myDataRoomsLink.click();
  }

  async openSharedWithMe(): Promise<void> {
    await this.sharedWithMeLink.click();
  }
}
