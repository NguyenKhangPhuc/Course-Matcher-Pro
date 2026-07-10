'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'
import { LoginForm, ResetPasswordForm, SignupForm, VerifyAccountForm } from '../types/authentication'

export async function getUser() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser()
    return { data, error }
}
export async function login(formData: LoginForm) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.email,
        password: formData.password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.code }
    }

    redirect('/dashboard')
}

export async function signup(formData: SignupForm, origin: string) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs


    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName, email: formData.email }, emailRedirectTo: `${origin}/auth/callback`, }
    })

    if (error) {
        return { error: error.code }
    }
    // console.log("DATA", data)
    // console.log("ERROR", error)

    redirect(`/sign-up/verify-account?email=${formData.email}`)
}

export async function signout() {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const { error } = await supabase.auth.signOut()

    if (error) {
        return { error: error.code }
    }
    redirect('/login')
}

export async function resendVerificationCode(email: string, origin: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`
        }
    })

    if (error) {
        return { data, error: error.code }
    }

    return { data }
}

export async function verifySignUpAccount(verifyAccount: VerifyAccountForm) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp(
        {
            email: verifyAccount.email,
            token: verifyAccount.otp,
            type: 'signup'
        }
    )
    if (error) {
        return { error: 'Fail to verify the OTP' }
    }
    if (data.session == null) {
        return { error: 'Fail to verify the OTP' }
    }
    return { data, error }
}


export async function resetPassword(resetPasswordData: ResetPasswordForm) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp(
        {
            email: resetPasswordData.email,
            token: resetPasswordData.otp,
            type: 'email'
        }
    )
    if (error) {
        return { error: 'Fail to verify the OTP' }
    }

    if (data.session == null) {
        return { error: 'Fail to update the user password' }
    }
    const { error: userError } = await supabase.auth.updateUser({ password: resetPasswordData.newPassword })
    if (userError) {
        return { error: 'Fail to update the user password' }
    }
    await supabase.auth.signOut({ scope: 'global' });

    return { error: null }
}