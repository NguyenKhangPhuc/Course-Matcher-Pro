'use client'
import GitHubIcon from '@mui/icons-material/GitHub';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { login, resendVerificationCode } from '../actions/authentication';
import { useLoader } from '../context/LoaderContext';
import { useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import { useNotification } from '../context/Notification';
import { LoginForm } from '../types/authentication';
import { AUTH_ERROR_CODE } from '../types/enum';
const Home = () => {
    const { showNotification } = useNotification();
    const supabase = createClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<LoginForm>()
    const { setIsOpenLoader } = useLoader()
    const router = useRouter()
    const handleLoginWithGithub = async () => {
        const isAcceptedTerm = getValues('isTermAccepted');
        if (isAcceptedTerm) {
            await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
        } else {
            showNotification('Please accept the terms conditions and privacy policy')
        }
    }
    const onSubmit = async (userInfo: LoginForm) => {
        setIsOpenLoader(true)
        try {
            const { error } = await login(userInfo)

            if (error) {
                throw new Error(error)
            }

        } catch (error) {

            if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
                if (error instanceof Error && error.message == AUTH_ERROR_CODE.EMAIL_NOT_CONFIRMED) {
                    try {
                        await resendVerificationCode(userInfo.email, window.location.origin)
                        showNotification('Please verify your email')
                        router.push(`/sign-up/verify-account?email=${userInfo.email}`)
                    } catch (error) {
                        showNotification('Failed to send verification code')
                    }
                } else if (error instanceof Error && error.message == AUTH_ERROR_CODE.INVALID_CREDENTIALS) {
                    showNotification("Invalid credentials")
                } else {
                    showNotification('Failed to login')
                }
            } else if (error instanceof Error && error.message == 'NEXT_REDIRECT') {
                showNotification('Login successfully')
            }
            setIsOpenLoader(false)

        }
    }

    return (
        <div className="p-5 flex flex-col justify-center items-center">
            <form className="login-form">
                <div className="login-label-container">
                    <label>Email </label></div>
                <div className="inputForm">
                    <EmailIcon/>
                    <input placeholder="Enter your Email" className="input" type="text" />
                </div>

                <div className="login-label-container">
                    <label>Password </label></div>
                <div className="inputForm">
                    <PasswordIcon/>
                    <input placeholder="Enter your Password" className="input" type="password" />
                </div>

                <div className="login-subinfo">
                    <div>
                        <input type="radio" />
                        <label>Remember me </label>
                    </div>
                    <span className="login-span">Forgot password?</span>
                </div>
                <button className="button-submit">Sign In</button>
                <p className="p">Don&apos;t have an account? <Link href={`/sign-up`} className="login-span">Sign Up</Link>

                </p><p className="login-text line">Or With</p>

                <div className="login-subinfo">
                    <button className="btn apple">
                        <GitHubIcon/>
                        Github

                    </button></div></form>
        </div>
    )
}

export default Home