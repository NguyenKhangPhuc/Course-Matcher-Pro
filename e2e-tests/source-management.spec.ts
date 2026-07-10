import { test, expect, Browser, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SourceManagementPage } from './pages/SourceManagementPage';
import { TEST_ACCOUNT, TEST_PASSWORD } from '../app/constant';

/**
 * Logs in with the shared test account and waits for the dashboard redirect.
 */
async function loginUser(page: Page): Promise<void> {
    const loginPage = new LoginPage(page);

    await loginPage.navigateTo();
    await loginPage.signIn(TEST_ACCOUNT, TEST_PASSWORD);
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/dashboard\/?$/, { timeout: 40000 });
}

test.describe.configure({ mode: 'serial' });

test.describe('Source Management Flow', () => {
    let browser: Browser;
    let sharedPage: Page;
    let sourceManagementPage: SourceManagementPage;

    test.beforeAll(async ({ browser: b }, testInfo) => {
        testInfo.setTimeout(testInfo.timeout + 40_000);
        browser = b;
        sharedPage = await browser.newPage();
        sourceManagementPage = new SourceManagementPage(sharedPage);
        await loginUser(sharedPage);
    });

    test.afterAll(async () => {
        await sharedPage.close();
    });

    test('should display the Source Management page heading after login', async () => {
        /**
         * Target: Source Management Page — Page Heading
         * Scenario: Navigate to /source-management while authenticated.
         * Expectation: The "Source Management" h1 heading is visible on the page.
         */
        await sourceManagementPage.navigateTo();
        await expect(sharedPage).toHaveURL(/\/source-management/, { timeout: 15000 });

        await expect(sourceManagementPage.heading).toBeVisible();
        await expect(sourceManagementPage.heading).toHaveText('Source Management');
    });

    test('should display the sources table with at least one source row', async () => {
        /**
         * Target: Source Management Page — Sources Table
         * Scenario: Navigate to /source-management as an authenticated user who has seeded sources.
         * Expectation: The sources table is visible and at least one source row is rendered.
         */
        await expect(sourceManagementPage.sourcesTable).toBeVisible();
        await expect(sourceManagementPage.sourceRows.first()).toBeVisible();
    });

    test('should expand a source row and display the nested courses panel', async () => {
        /**
         * Target: Source Management Page — Expandable Source Row
         * Scenario: Click the first source row to expand it.
         * Expectation: The nested courses panel becomes visible beneath the expanded row.
         */
        await sourceManagementPage.expandFirstSource();

        await expect(sourceManagementPage.nestedCoursesPanel).toBeVisible();
    });
});
