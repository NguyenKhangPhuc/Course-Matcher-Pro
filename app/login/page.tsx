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
        // setIsOpenLoader({isOpen: true})
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
            setIsOpenLoader({isOpen: false})

        }
    }

    return (
        <div className="p-5 flex flex-col justify-center items-center min-h-screen">
            <form className="flex flex-col gap-2 rounded-[50px] bg-[#e0e0e0] 
                               shadow-template
                               flex flex-col duration-300 p-8 w-[450px] rounded-lg font-roboto-mono" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col">
                    <label className="text-[#151717] mb-1 font-semibold">Email</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <EmailIcon />
                        <input
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
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col mt-4">
                    <label className="text-[#151717] font-semibold mb-1">Password</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <PasswordIcon />
                        <input
                            type="password"
                            placeholder="Enter your Password"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must above 8 characters"
                                }
                            })}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center gap-2 text-sm font-normal text-black">
                        <input type="checkbox" />
                        Remember me
                    </label>
                    <Link href={`/forget-password`} className="text-blue-600 font-medium text-sm cursor-pointer">Forgot password?</Link>
                </div>


                <div className="flex flex-col mt-4">
                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="isTermAccepted"
                            className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                            {...register("isTermAccepted", {
                                required: "You must accept the Terms and Privacy Policy to continue"
                            })}
                        />
                        <label htmlFor="isTermAccepted" className="text-sm text-[#151717] cursor-pointer leading-tight font-roboto-mono">
                            I have read and agree to the{" "}
                            <Link href="/terms-and-conditions" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                                Terms & Conditions
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy-policy" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                                Privacy Policy
                            </Link>.
                        </label>
                    </div>

                    {errors.isTermAccepted && (
                        <p className="text-red-500 text-xs mt-1 font-roboto-mono">
                            {errors.isTermAccepted.message}
                        </p>
                    )}
                </div>
                 <button className="mt-5 w-full text-white font-medium rounded-xl text-base uppercase login_btn"><i className="animation"></i>Sign In<i className="animation"></i>
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