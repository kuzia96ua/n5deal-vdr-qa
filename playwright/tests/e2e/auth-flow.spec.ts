import { test, expect } from '../../src/fixtures/vdr.fixture';
import { TEST_USERS, TOAST_MESSAGES } from '../../src/data';

test.describe('E2E UI: Authentication & Session Flow', () => {
  test('UI-AUTH-01: Should display login page and successfully sign in and sign out', async ({ page, loginPage, dataRoomPage }) => {
    await test.step('Navigate to Login page', async () => {
      await loginPage.goto();
    });

    await test.step('Attempt sign in with invalid password', async () => {
      await loginPage.login(TEST_USERS.OWNER.email, TEST_USERS.INVALID.pass);
      await expect(page).toHaveURL(/.*\/login/);
      await expect(loginPage.getToast(TOAST_MESSAGES.INVALID_CREDENTIALS)).toBeVisible();
    });

    await test.step('Sign in with valid test credentials', async () => {
      await loginPage.login(TEST_USERS.OWNER.email, TEST_USERS.OWNER.pass);
      await page.waitForURL('**/', { timeout: 10000 });
      await expect(dataRoomPage.userProfileLabel).toContainText(TEST_USERS.OWNER.name);
    });

    await test.step('Sign out from the application', async () => {
      await dataRoomPage.signOut();
      await page.waitForURL('**/login', { timeout: 10000 });
      await expect(loginPage.signInButton).toBeVisible();
    });
  });
});
