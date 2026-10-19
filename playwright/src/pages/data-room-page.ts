import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DataRoomPage extends BasePage {
  readonly breadcrumbNav: Locator;
  readonly uploadButton: Locator;
  readonly newFolderButton: Locator;
  readonly shareButton: Locator;
  readonly dropzoneArea: Locator;
  readonly fileInput: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumbNav = page.getByRole('navigation', { name: 'Breadcrumb' });
    this.uploadButton = page.getByRole('button', { name: 'Upload' });
    this.newFolderButton = page.getByRole('button', { name: 'New folder' });
    this.shareButton = page.getByRole('button', { name: 'Share' });
    this.dropzoneArea = page.getByText('Drag & drop PDF files anywhere to upload');
    this.fileInput = page.locator('input[type="file"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async clickNewFolder(): Promise<void> {
    await this.newFolderButton.click();
  }

  async clickShare(): Promise<void> {
    await this.shareButton.click();
  }

  getItemRow(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async openFolder(name: string): Promise<void> {
    await this.page.getByText(name, { exact: true }).click();
  }

  async openItemActions(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Actions for ${name}` }).click();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }
}
