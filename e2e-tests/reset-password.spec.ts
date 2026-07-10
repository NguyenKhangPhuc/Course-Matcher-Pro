import { test, expect } from '@playwright/test';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

test.describe('Reset Password Flow', () => {

    test('should show required validation errors when submitting an empty form', async ({ page }) => {
        /**
         * Target: Reset Password Page - Client-side Required Field Validation
         * Scenario: Navigate to /reset-password with a pre-filled email query param,
         *           and click "Update Password" without filling OTP, new password, or confirm password.
         * Expectation: Required error messages are visible for OTP, new password, and confirm password fields.
         */
        const resetPasswordPage = new ResetPasswordPage(page);

        await resetPasswordPage.navigateTo();
        await resetPasswordPage.submitForm();

        await expect(resetPasswordPage.otpError).toBeVisible();
        await expect(resetPasswordPage.otpError).toHaveText('OTP is required');
        await expect(resetPasswordPage.newPasswordError).toBeVisible();
        await expect(resetPasswordPage.newPasswordError).toHaveText('New Password is required');
        await expect(resetPasswordPage.confirmPasswordError).toBeVisible();
        await expect(resetPasswordPage.confirmPasswordError).toHaveText('Confirm New Password Required');
    });

    test('should show password length error when new password is shorter than 8 characters', async ({ page }) => {
        /**
         * Target: Reset Password Page - New Password Minimum Length Validation
         * Scenario: Fill in a valid OTP and a password that is under 8 characters, then submit.
         * Expectation: A "Password must above 8 characters" error is shown under the New Password field.
         */
        const resetPasswordPage = new ResetPasswordPage(page);

        await resetPasswordPage.navigateTo();
        await resetPasswordPage.fillOtp('123456');
        await resetPasswordPage.fillNewPassword('short');
        await resetPasswordPage.fillConfirmPassword('short');
        await resetPasswordPage.submitForm();

        await expect(resetPasswordPage.newPasswordError).toBeVisible();
        await expect(resetPasswordPage.newPasswordError).toHaveText('Password must above 8 characters');
    });

    test('should show confirm password mismatch error when passwords do not match', async ({ page }) => {
        /**
         * Target: Reset Password Page - Password Confirmation Match Validation
         * Scenario: Fill in a valid OTP and a valid new password (8+ chars), then enter a
         *           different value in the confirm password field and submit.
         * Expectation: A "Password does not match" error is shown under the Confirm Password field.
         */
        const resetPasswordPage = new ResetPasswordPage(page);

        await resetPasswordPage.navigateTo();
        await resetPasswordPage.fillOtp('123456');
        await resetPasswordPage.fillNewPassword('SecurePass123');
        await resetPasswordPage.fillConfirmPassword('DifferentPass456');
        await resetPasswordPage.submitForm();

        await expect(resetPasswordPage.confirmPasswordError).toBeVisible();
        await expect(resetPasswordPage.confirmPasswordError).toHaveText('Password does not match');
    });
});
