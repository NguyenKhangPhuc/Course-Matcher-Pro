import { test, expect } from '@playwright/test';
import { ForgetPasswordPage } from './pages/ForgetPasswordPage';

test.describe('Forget Password Flow', () => {

    test('should show email required error when submitting an empty form', async ({ page }) => {
        /**
         * Target: Forget Password Page - Client-side Email Validation
         * Scenario: Navigate to /forget-password and click "Send OTP" without filling in any field.
         * Expectation: An "Email is required" validation error is displayed beneath the email field.
         */
        const forgetPasswordPage = new ForgetPasswordPage(page);

        await forgetPasswordPage.navigateTo();
        await forgetPasswordPage.submitForm();

        await expect(forgetPasswordPage.emailError).toBeVisible();
        await expect(forgetPasswordPage.emailError).toHaveText('Email is required');
        await expect(page).toHaveURL(/\/forget-password$/, { timeout: 15000 });
    });

    test('should show invalid email error for a malformed email address', async ({ page }) => {
        /**
         * Target: Forget Password Page - Email Format Validation
         * Scenario: Enter a syntactically invalid email (missing "@domain") into the email
         *           field and submit the form.
         * Expectation: An "Invalid Email" validation error is displayed and the user remains
         *              on the Forget Password page.
         */
        const forgetPasswordPage = new ForgetPasswordPage(page);

        await forgetPasswordPage.navigateTo();
        await forgetPasswordPage.fillEmail('not-an-email');
        await forgetPasswordPage.submitForm();

        await expect(forgetPasswordPage.emailError).toBeVisible();
        await expect(forgetPasswordPage.emailError).toHaveText('Invalid Email');
        await expect(page).toHaveURL(/\/forget-password$/, { timeout: 15000 });
    });

    test('should navigate to Login page when clicking "Back to sign in"', async ({ page }) => {
        /**
         * Target: Forget Password Page - Navigation Link
         * Scenario: Navigate to /forget-password and click the "Back to sign in" link.
         * Expectation: The browser redirects to the /login route.
         */
        const forgetPasswordPage = new ForgetPasswordPage(page);

        await forgetPasswordPage.navigateTo();
        await forgetPasswordPage.backToSignInLink.click();

        await expect(page).toHaveURL(/\/login$/, { timeout: 15000 });
    });

    test('should navigate to Sign Up page when clicking "Sign Up"', async ({ page }) => {
        /**
         * Target: Forget Password Page - Sign Up Navigation Link
         * Scenario: Navigate to /forget-password and click the "Sign Up" link at the bottom of the form.
         * Expectation: The browser redirects to the /sign-up route.
         */
        const forgetPasswordPage = new ForgetPasswordPage(page);

        await forgetPasswordPage.navigateTo();
        await forgetPasswordPage.signUpLink.click();

        await expect(page).toHaveURL(/\/sign-up$/, { timeout: 15000 });
    });
});
