'use client'
import HttpsIcon from '@mui/icons-material/Https';
import GitHubIcon from '@mui/icons-material/GitHub';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { login } from '../actions/authentication';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';
import { useLoader } from '../context/LoaderContext';
import { useNotification } from '../context/Notification';
import { LoginForm } from '../types/authentication';
const Home = () => {
    const { showNotification } = useNotification();
    const supabase = createClient();
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>()
    const { setIsOpenLoader } = useLoader()
    const handleLoginWithGithub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }
    const onSubmit = async (userInfo: LoginForm) => {
        setIsOpenLoader({ isOpen: true })
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(userInfo.email)
            if (error) {
                throw new Error('Failed to send the verification code')
            }
            showNotification('Send OTP code successfully')
            setIsOpenLoader({ isOpen: false })
            router.push(`/reset-password?email=${userInfo.email}`)
        } catch (error) {
            if (error instanceof Error) {
                showNotification(error.message)
            }
            setIsOpenLoader({ isOpen: false })
        }
    }
    return (
        <div className="p-5 flex flex-col justify-center items-center min-h-screen">
            <form data-testid="forget-password-form" className="flex flex-col gap-2 rounded-[50px] bg-[#e0e0e0] 
                               shadow-template
                               flex flex-col duration-300 p-8 w-[450px] rounded-lg font-roboto-mono" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col">
                    <Link href={`/login`} className=' flex font-roboto-mono pb-5 gap-5 text-sm items-center hover:pl-2 duration-300 cursor-pointer '>
                        <ArrowBackIosNewIcon sx={{ fontSize: '15px' }} />
                        <div>Back to sign in</div>
                    </Link>

                    <label className="text-[#151717] mb-1 font-semibold">Email</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <AlternateEmailIcon />
                        <input
                            data-testid="forget-password-email-input"
                            type="text"
                            placeholder="Enter your Email"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400  text-black "
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid Email"
                                }
                            })}
                        />
                    </div>
                    {errors.email && (
                        <p data-testid="forget-password-email-error" className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <button data-testid="forget-password-submit-btn" className="mt-5 w-full text-white font-medium rounded-xl text-base uppercase login_btn"><i className="animation"></i>Send OTP<i className="animation"></i>
                </button>

                <p className="text-center text-sm text-black mt-3">
                    Don&apos;t have an account? <Link href={'/sign-up'} className="text-blue-600 font-medium cursor-pointer">Sign Up</Link>
                </p>

                <p className="text-center text-sm text-black mt-3">OR</p>

                <div className="flex gap-2 mt-3 font-mono text-black">
                    <div
                        className="cursor-pointer flex-1 flex gap-2 justify-center items-center gap-2 h-12 rounded-xl border border-gray-400 bg-white font-medium transition hover:border-blue-600"
                        onClick={() => handleLoginWithGithub()}
                    >
                        <GitHubIcon />
                        <div>Github</div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Home