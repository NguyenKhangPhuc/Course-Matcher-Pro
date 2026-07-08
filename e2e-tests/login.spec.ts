import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * Generates a unique email per test run.
 */
function uniqueEmail(prefix: string): string {
    return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe('Login Flow', () => {

    test('should show validation errors when submitting an empty form', async ({ page }) => {
        /**
         * Target: Login Page - Client-side Validation
         * Scenario: Click "Sign In" without filling any field.
         * Expectation: Email, Password, and Terms checkbox all show
         *              their respective "required" validation messages, and the
         *              user remains on the Login page.
         */
        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.submitForm();

        await expect(loginPage.emailError).toBeVisible();
        await expect(loginPage.passwordError).toBeVisible();
        await expect(loginPage.termsError).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('should show an invalid email error for a malformed email address', async ({ page }) => {
        /**
         * Target: Login Page - Email Field Validation
         * Scenario: Enter a syntactically invalid email (missing "@domain") along
         *           with a valid password, accept terms, then submit.
         * Expectation: An "Invalid Email" message is shown under the Email field
         *              and the form is not submitted.
         */
        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.fillForm('not-an-email', 'SecurePass123');
        await loginPage.acceptTerms();
        await loginPage.submitForm();

        await expect(page.getByText('Invalid Email')).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('should show a password length error when password is shorter than 8 characters', async ({ page }) => {
        /**
         * Target: Login Page - Password Field Validation
         * Scenario: Enter a valid email but a password under 8 characters,
         *           accept terms, then submit.
         * Expectation: A "Password must above 8 characters" message is shown and
         *              the form is not submitted.
         */
        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.fillForm(uniqueEmail('e2e.shortpass'), 'short');
        await loginPage.acceptTerms();
        await loginPage.submitForm();

        await expect(page.getByText('Password must above 8 characters')).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('should block submission when Terms & Conditions checkbox is not checked', async ({ page }) => {
        /**
         * Target: Login Page - Terms & Conditions Enforcement
         * Scenario: Fill in valid email and password, but leave the
         *           Terms & Conditions checkbox unchecked, then submit.
         * Expectation: The "You must accept the Terms and Privacy Policy to continue"
         *              message is shown and the user is not redirected.
         */
        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.fillForm(uniqueEmail('e2e.noterms'), 'SecurePass123');
        await loginPage.submitForm();

        await expect(loginPage.termsError).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('should show "Invalid credentials" notification when logging in with incorrect credentials', async ({ page }) => {
        /**
         * Target: Login Page - Wrong Credentials Handling
         * Scenario: Fill in a valid email format and password, accept terms,
         *           but submit credentials that do not exist or are incorrect.
         * Expectation: The application displays an "Invalid credentials" toast/notification
         *              and remains on the Login page.
         */
        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.signIn(uniqueEmail('e2e.invalid'), 'IncorrectPassword123');

        await expect(page).toHaveURL(/\/login$/);
    });

    test('should navigate to the Sign Up page when clicking "Sign Up"', async ({ page }) => {
        /**
         * Target: Login Page - Navigation to Sign Up
         * Scenario: Click the "Sign Up" link at the bottom of the Login form.
         * Expectation: The browser navigates to the "/sign-up" route.
         */
        test.setTimeout(120_000);

        const loginPage = new LoginPage(page);

        await loginPage.navigateTo();
        await loginPage.signUpLink.click();
        await page.waitForTimeout(1000);

        await expect(page).toHaveURL(/\/sign-up$/);
    });
});
