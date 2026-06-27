export interface LoginForm {
    email: string;
    password: string;
    isTermAccepted: boolean;
}

export interface SignupForm {
    fullName: string;
    email: string;
    password: string;
    isTermAccepted: boolean;
}

export interface ResetPasswordForm {
    email: string,
    otp: string,
    newPassword: string,
    confirmedNewPassword: string,
}

export interface VerifyAccountForm {
    email: string,
    otp: string,
}