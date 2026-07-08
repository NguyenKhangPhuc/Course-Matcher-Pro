import { test, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const TEST_EMAIL = 'nguyenkhangphuc012024@gmail.com';
const TEST_PASSWORD = '1231232312123';

/**
 * Logs in with the seeded test user account.
 */
async function loginUser(page: Page, email: string): Promise<void> {
  const loginPage = new LoginPage(page);

  await loginPage.navigateTo();
  await loginPage.signIn(email, TEST_PASSWORD);
  await expect(page).toHaveURL(/http:\/\/localhost:3000\/dashboard\/?$/);
}

test.describe.configure({ mode: 'serial' });

test.describe('Dashboard Flow', () => {
  let sharedPage: Page;
  let dashboardPage: DashboardPage;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    dashboardPage = new DashboardPage(sharedPage);
    await loginUser(sharedPage, TEST_EMAIL);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test('should load layout components and show preloaded course data', async () => {
    /**
     * Target: Dashboard Page - Initial Load and Course Data Seeding
     * Scenario: Navigate directly to the Dashboard page, select the seeded "example.xlsx" source.
     * Expectation: The "Course Data" and "Target Job" cards are displayed.
     *              After selecting the source, the course table displays the three seeded courses.
     */
    await dashboardPage.navigateTo();

    // Layout check
    await expect(dashboardPage.courseDataTitle).toBeVisible();
    await expect(dashboardPage.targetJobTitle).toBeVisible();

    // Select the seeded source pill
    await dashboardPage.selectSource('example.xlsx');

    // Verify that the success notification is shown or courses load
    await expect(sharedPage.getByText('Load the courses successfully')).toBeVisible();

    // Verify all 3 seeded courses are listed in the table
    await expect(dashboardPage.courseTableRows).toHaveCount(3);
    await expect(dashboardPage.courseTable.getByText('Introduction to Computer Science')).toBeVisible();
    await expect(dashboardPage.courseTable.getByText('Advanced Web Development')).toBeVisible();
    await expect(dashboardPage.courseTable.getByText('Artificial Intelligence Fundamentals')).toBeVisible();
  });

  test('should show Target Job form client-side validation errors after selecting source and programme', async () => {
    /**
     * Target: Dashboard Page - Target Job Form Validation
     * Scenario: Select the seeded source "example.xlsx", wait for courses to load,
     *           choose the "Software Engineering" programme, and then submit the empty Target Job form.
     * Expectation: The browser displays client-side validation errors for required inputs:
     *              Company Name, Position, and Job Description.
     */
    await dashboardPage.navigateTo();

    // Select source
    await dashboardPage.selectSource('example.xlsx');
    await expect(sharedPage.getByText('Load the courses successfully')).toBeVisible();

    // Select programme
    await dashboardPage.selectProgramme('Software Engineering');

    // Submit form directly
    await dashboardPage.submitJobForm();

    // Validate error messages
    await expect(dashboardPage.companyError).toBeVisible();
    await expect(dashboardPage.positionError).toBeVisible();
    await expect(dashboardPage.jobDescError).toBeVisible();
  });

  test('should analyze job description using mocked stream and display results', async () => {
    /**
     * Target: Dashboard Page - Streaming Job Analysis
     * Scenario: Intercept the client-side Axios post request to /api/chat. Mock the SSE stream response
     *           containing requirements, courses, and complete events. Select the source "example.xlsx",
     *           choose the "Software Engineering" programme, fill form details, then run the analysis.
     * Expectation: The analysis results section animates onto the page, displays identified requirements,
     *              shows the matching course card with its score and details, and triggers the save search modal.
     */
    // 1. Mock the /api/chat stream endpoint
    await sharedPage.route('**/api/chat', async (route) => {
      const chunks = [
        'data: {"type": "requirements", "data": "React, TypeScript, Next.js, Tailwind CSS"}\n\n',
        'data: {"type": "course", "data": {"id": "c2", "name": "Advanced Web Development", "similarity": 96.5, "explanation": "Matches React and Next.js requirements perfectly.", "study_option": "Full-time", "programme": "Software Engineering"}}\n\n',
        'data: {"type": "done", "data": {"summary": "AI matching has successfully analyzed the description."}}\n\n'
      ];

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: chunks.join('')
      });
    });

    await dashboardPage.navigateTo();

    // 2. Select source
    await dashboardPage.selectSource('example.xlsx');
    await expect(sharedPage.getByText('Load the courses successfully')).toBeVisible();

    // 3. Select programme
    await dashboardPage.selectProgramme('Software Engineering');

    // 4. Fill job description form
    await dashboardPage.fillJobForm(
      'Google LLC',
      'Senior Frontend Developer',
      'We are looking for a frontend developer with strong skills in React, TypeScript, Next.js, and CSS styling.'
    );

    // 5. Submit Form
    await dashboardPage.submitJobForm();

    // 6. Verify Results Displayed
    await expect(dashboardPage.resultsSection).toBeVisible();
    await expect(dashboardPage.requirementsText).toHaveText('React, TypeScript, Next.js, Tailwind CSS');

    // Verify the matched course card
    const card = dashboardPage.courseCards.first();
    await expect(card).toBeVisible();
    await expect(card.locator('text=97%')).toBeVisible(); // 96.5% rounded up
    await expect(card.locator('text=Advanced Web Development')).toBeVisible();
    await expect(card.locator('text=Matches React and Next.js requirements perfectly.')).toBeVisible();

    // 7. Verify Save Search Modal pops up
    await expect(dashboardPage.saveModalTitle).toBeVisible({ timeout: 10000 });

    // Dismiss the modal
    await dashboardPage.saveNoButton.click();
    await expect(dashboardPage.saveModalTitle).not.toBeVisible();
  });
});
