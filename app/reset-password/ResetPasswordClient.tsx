'use client'
import { createClient } from "@supabase/supabase-js";
import { useForm, useWatch } from "react-hook-form";
import HttpsIcon from '@mui/icons-material/Https';
import GitHubIcon from '@mui/icons-material/GitHub';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useLoader } from "../context/LoaderContext";
import { useNotification } from "../context/Notification";
import { resetPassword } from "../actions/authentication";
import { ResetPasswordForm } from "../types/authentication";
export const ResetPasswordClient = ({ email }: { email: string }) => {
    const { showNotification } = useNotification();
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordForm>({
        defaultValues: {
            email
        }
    })
    const { setIsOpenLoader } = useLoader()
    const newPasswordValue = useWatch({
        defaultValue: "",
        name: 'newPassword',
        control: control

    });
    const onSubmit = async (userInfo: ResetPasswordForm) => {
        setIsOpenLoader({ isOpen: true })
        try {
            const { error } = await resetPassword(userInfo)
            if (error) {
                throw new Error(error)
            }
            setIsOpenLoader({ isOpen: false })
            showNotification('Update successfully')
            router.push('/login')
        } catch (error) {
            setIsOpenLoader({ isOpen: false })
            if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
                showNotification(error.message)
            }

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
                        <AlternateEmailIcon />
                        <input
                            disabled
                            type="text"
                            placeholder="Enter your Email"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400  text-black cursor-not-allowed "
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
                    <label className="text-[#151717] font-semibold mb-1">Received OTP</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <HttpsIcon />
                        <input
                            data-testid="reset-otp-input"
                            type="password"
                            placeholder="Enter your Received OTP"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400"
                            {...register('otp', {
                                required: "OTP is required",
                            })}
                        />
                    </div>
                    {errors.otp && (
                        <p data-testid="reset-otp-error" className="text-red-500 text-sm mt-1">
                            {errors.otp.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col mt-4">
                    <label className="text-[#151717] font-semibold mb-1"> New Password</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <HttpsIcon />
                        <input
                            data-testid="reset-new-password-input"
                            type="password"
                            placeholder="Enter your Password"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400"
                            {...register('newPassword', {
                                required: "New Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must above 8 characters"
                                }
                            })}
                        />
                    </div>
                    {errors.newPassword && (
                        <p data-testid="reset-new-password-error" className="text-red-500 text-sm mt-1">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col mt-4">
                    <label className="text-[#151717] font-semibold mb-1">Confirm your password</label>
                    <div className="border border-gray-200 rounded-xl h-12 flex items-center px-2 focus-within:border-blue-600 transition text-black/50">
                        <HttpsIcon />
                        <input
                            data-testid="reset-confirm-password-input"
                            type="password"
                            placeholder="Confirm your password"
                            className="flex-1 h-full border-none outline-none px-2 placeholder-gray-400"
                            {...register('confirmedNewPassword', {
                                required: "Confirm New Password Required",
                                minLength: {
                                    value: 8,
                                    message: "Password must above 8 characters"
                                },
                                validate: (val: string) => {
                                    if (newPasswordValue != val) {
                                        return "Password does not match";
                                    }
                                }
                            })}
                        />
                    </div>
                    {errors.confirmedNewPassword && (
                        <p data-testid="reset-confirm-password-error" className="text-red-500 text-sm mt-1">
                            {errors.confirmedNewPassword.message}
                        </p>
                    )}
                </div>

                <button data-testid="reset-submit-btn" className="mt-5 w-full text-white font-medium rounded-xl text-base uppercase login_btn"><i className="animation"></i>Update Password<i className="animation"></i>
                </button>

                <p className="text-center text-sm text-black mt-3">
                    Don&apos;t have an account? <Link href={'/sign-up'} className="text-blue-600 font-medium cursor-pointer">Sign Up</Link>
                </p>

            </form>

        </div>
    )
}

export default ResetPasswordClient