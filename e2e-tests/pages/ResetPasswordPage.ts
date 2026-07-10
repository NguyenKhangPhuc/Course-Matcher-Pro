import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Reset Password page ("/reset-password").
 */
export class ResetPasswordPage {
    readonly page: Page;

    readonly otpInput: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly submitBtn: Locator;

    readonly otpError: Locator;
    readonly newPasswordError: Locator;
    readonly confirmPasswordError: Locator;

    readonly signUpLink: Locator;

    constructor(page: Page) {
        this.page = page;

        this.otpInput = page.getByTestId('reset-otp-input');
        this.newPasswordInput = page.getByTestId('reset-new-password-input');
        this.confirmPasswordInput = page.getByTestId('reset-confirm-password-input');
        this.submitBtn = page.getByTestId('reset-submit-btn');

        this.otpError = page.getByTestId('reset-otp-error');
        this.newPasswordError = page.getByTestId('reset-new-password-error');
        this.confirmPasswordError = page.getByTestId('reset-confirm-password-error');

        this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
    }

    async navigateTo(email = 'test@example.com'): Promise<void> {
        await this.page.goto(`/reset-password?email=${email}`);
    }

    async fillOtp(otp: string): Promise<void> {
        await this.otpInput.fill(otp);
    }

    async fillNewPassword(password: string): Promise<void> {
        await this.newPasswordInput.fill(password);
    }

    async fillConfirmPassword(password: string): Promise<void> {
        await this.confirmPasswordInput.fill(password);
    }

    async submitForm(): Promise<void> {
        await this.submitBtn.click();
    }
}
