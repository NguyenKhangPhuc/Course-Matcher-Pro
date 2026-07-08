import { test, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { HistoryPage } from './pages/HistoryPage';

const TEST_EMAIL = 'nguyenkhangphuc012024@gmail.com';
const TEST_PASSWORD = '1231232312123';

/**
 * Logs in with the seeded test user account.
 */
async function loginUser(page: Page, email: string): Promise<void> {
    const loginPage = new LoginPage(page);

    await loginPage.navigateTo();
    await loginPage.signIn(email, TEST_PASSWORD);
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/dashboard\/?$/, { timeout: 40000 });
}

test.describe.configure({ mode: 'serial' });

test.describe('Search History Flow', () => {
    let sharedPage: Page;
    let historyPage: HistoryPage;

    test.beforeAll(async ({ browser }, testInfo) => {
        testInfo.setTimeout(testInfo.timeout + 40_000);

        sharedPage = await browser.newPage();
        historyPage = new HistoryPage(sharedPage);
        await loginUser(sharedPage, TEST_EMAIL);
    });

    test.afterAll(async () => {
        await sharedPage.close();
    });

    test('should navigate to history page via sidebar and verify page content', async () => {
        /**
         * Target: History Page - Navigation and Content Verification
         * Scenario: Start on the home page, click the "History" link in the sidebar navigation.
         * Expectation: The browser redirects to "/history", and the seeded history item
         *              displaying company, position, programme, and technical requirements is visible.
         */
        // Navigate to home page first
        await sharedPage.goto('/');

        // Click the sidebar "History" navigation link
        const historyLink = sharedPage.locator('aside.nav-sidebar').getByRole('link', { name: 'History' });
        await expect(historyLink).toBeVisible();
        await historyLink.click();

        // Verify URL and Page Header
        await expect(sharedPage).toHaveURL(/\/history$/);
        await expect(historyPage.pageHeader).toBeVisible();

        // Verify historical details are displayed
        await expect(historyPage.companyNameText).toHaveText('Awesome Tech Corp');
        await expect(historyPage.positionText).toContainText('Senior Backend Developer');
        await expect(historyPage.programmeText).toContainText('Software Engineering');
        await expect(historyPage.requirementsText).toContainText('Python, OOP principles, Web APIs');
    });

    test('should display matched courses when history item is expanded', async () => {
        /**
         * Target: History Page - Item Expansion and Course Matches Grid
         * Scenario: Click the history item header card.
         * Expectation: The item expands to reveal the matched courses count and
         *              the grid of recommendations showing course names and similarity scores.
         */
        await historyPage.navigateTo();

        // Expand the search log card
        await historyPage.expandFirstItem();

        // Verify that the details are expanded
        await expect(historyPage.expandedPanel).toBeVisible();
        await expect(historyPage.matchCountText).toHaveText(/Matched Courses \(2\)/);

        // Verify course matches details
        const firstCard = historyPage.courseCards.nth(0);
        const secondCard = historyPage.courseCards.nth(1);

        await expect(firstCard.locator('text=Introduction to Computer Science')).toBeVisible();
        await expect(firstCard.locator('text=90%')).toBeVisible(); // 89.5% similarity -> 90%
        await expect(firstCard.locator('text=Full-time')).toBeVisible();

        await expect(secondCard.locator('text=Advanced Web Development')).toBeVisible();
        await expect(secondCard.locator('text=65%')).toBeVisible(); // 65.2% similarity -> 65%
    });

    test('should display full learning outcomes when a course card is clicked', async () => {
        /**
         * Target: History Page - Match Card Learning Outcomes Toggle
         * Scenario: Expand the history log, click a course match card.
         * Expectation: The learning outcomes text expands and is displayed in full.
         */
        await historyPage.navigateTo();
        await historyPage.expandFirstItem();

        // Click first course card to toggle learning outcomes
        await historyPage.clickCourseCard('Introduction to Computer Science');
        const firstCardText = historyPage.courseCards.filter({ hasText: 'Introduction to Computer Science' }).locator('p').nth(1);
        await expect(firstCardText).toHaveText('Understand basic variables, loops, functions, and OOP principles.');

        // Click second course card to toggle learning outcomes
        await historyPage.clickCourseCard('Advanced Web Development');
        const secondCardText = historyPage.courseCards.filter({ hasText: 'Advanced Web Development' }).locator('p').nth(1);
        await expect(secondCardText).toHaveText('Build single page applications with rich styling, state management, and SSR.');
    });
});
