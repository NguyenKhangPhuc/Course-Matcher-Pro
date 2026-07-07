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
  await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);
}

test.describe('Dashboard Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginUser(page, TEST_EMAIL);
    });

    test('should load layout components and show empty state messages when no source is selected', async ({ page }) => {
        /**
         * Target: Dashboard Page - Initial Load and Layout
         * Scenario: Log in as a seeded user and navigate directly to the Dashboard page.
         * Expectation: The "Course Data" and "Target Job" cards are displayed.
         *              Since it is a fresh account, the course table shows the empty state message,
         *              and the "Start Analyze Description" button is disabled.
         */
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.navigateTo();

        // Layout check
        await expect(dashboardPage.courseDataTitle).toBeVisible();
        await expect(dashboardPage.targetJobTitle).toBeVisible();

        // Empty state course data check
        await expect(page.getByText('Select a source above or upload a file to see courses.')).toBeVisible();

        // Analyze button should be disabled as no source is selected
        await expect(dashboardPage.analyzeButton).toBeDisabled();
    });

    test('should show Target Job form client-side validation errors', async ({ page }) => {
        /**
         * Target: Dashboard Page - Target Job Form Validation
         * Scenario: Navigate to Dashboard and click the disabled/enabled analyze button
         *           (or submit the form) directly with missing fields.
         * Expectation: The browser displays client-side validation errors for required inputs:
         *              Company Name, Position, and Job Description.
         */
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.navigateTo();

        // Submit form directly
        await dashboardPage.submitJobForm();

        // Validate error messages
        await expect(dashboardPage.companyError).toBeVisible();
        await expect(dashboardPage.positionError).toBeVisible();
        await expect(dashboardPage.jobDescError).toBeVisible();
    });

    test('should analyze job description using mocked stream and display results', async ({ page }) => {
        /**
         * Target: Dashboard Page - Streaming Job Analysis
         * Scenario: Intercept the client-side Axios post request to /api/chat. Mock the SSE stream response
         *           containing requirements, courses, and complete events. Fill form, select a programme
         *           (if a source is available), then run the analysis.
         * Expectation: The analysis results section animates onto the page, displays identified requirements,
         *              shows the matching course card with its score and details, and triggers the save search modal.
         */
        const dashboardPage = new DashboardPage(page);

        // 1. Mock the /api/chat stream endpoint
        await page.route('**/api/chat', async (route) => {
            const chunks = [
                'data: {"type": "requirements", "data": "React, TypeScript, Next.js, Tailwind CSS"}\n\n',
                'data: {"type": "course", "data": {"id": "c1", "name": "Advanced Web Engineering", "similarity": 96.5, "explanation": "Matches React and Next.js requirements perfectly.", "study_option": "Full-time", "programme": "Software Engineering"}}\n\n',
                'data: {"type": "done", "data": {"summary": "AI matching has successfully analyzed the description."}}\n\n'
            ];
            
            await route.fulfill({
                status: 200,
                contentType: 'text/event-stream',
                body: chunks.join('')
            });
        });

        // 2. Upload a sample file first to have a valid source ID
        await dashboardPage.navigateTo();
        await dashboardPage.uploadFile('public/examples/courses_example.csv');
        await expect(page.getByText(/Loaded \d+ courses successfully/)).toBeVisible();

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
        await expect(card.locator('text=Advanced Web Engineering')).toBeVisible();
        await expect(card.locator('text=Matches React and Next.js requirements perfectly.')).toBeVisible();

        // 7. Verify Save Search Modal pops up
        await expect(dashboardPage.saveModalTitle).toBeVisible({ timeout: 10000 });

        // Dismiss the modal
        await dashboardPage.saveNoButton.click();
        await expect(dashboardPage.saveModalTitle).not.toBeVisible();
    });
});
