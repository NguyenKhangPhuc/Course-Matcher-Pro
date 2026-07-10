'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-[#f0f7fa] flex flex-col font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-5 py-12 xl:p-20 lg:p-10 p-5 max-w-7xl mx-auto w-full flex-grow"
            >
                {/* Back to Home Link */}
                <Link 
                    href="/" 
                    className="inline-flex font-roboto-mono pb-5 gap-3 text-sm items-center hover:pl-2 duration-300 cursor-pointer text-[#1a5c55] font-semibold"
                >
                    <ArrowBackIosNewIcon sx={{ fontSize: '12px' }} />
                    <span>Back to home</span>
                </Link>

                {/* Page Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a5c55] leading-tight tracking-[-0.02em] mb-6">
                    Terms and Conditions
                </h1>

                <div className="bg-white rounded-2xl border border-[#d6edf5] p-6 sm:p-10 shadow-sm flex flex-col gap-6 text-[#1a2e35]">
                    
                    {/* Introduction */}
                    <section className="border-b border-[#e8f4f8] pb-6">
                        <h2 className="text-lg font-bold text-[#1a5c55] mb-3">About Course Matcher Pro</h2>
                        <p className="text-sm sm:text-[15px] text-[#6b9daa] leading-relaxed">
                            Course Matcher Pro is a nonprofit platform created to help students find suitable courses by analyzing job descriptions and course information. This project is developed with the sole purpose of supporting newly enrolled students, easing their transition into university studies, and boosting their future job opportunities.
                        </p>
                    </section>

                    {/* Disclaimer Box */}
                    <section className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6">
                        <h2 className="text-base font-bold text-red-700 mb-2">Disclaimer</h2>
                        <p className="text-sm text-red-600 leading-relaxed font-medium">
                            We are not responsible for any inaccuracies or errors in the default courses available on this website. These default courses are provided strictly as references. You are free to utilize them or upload/use your own course databases and sources.
                        </p>
                    </section>

                    {/* Terms Sections */}
                    <div className="flex flex-col gap-6 text-sm sm:text-[15px] text-[#6b9daa] leading-relaxed">
                        
                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">1. Acceptance of Terms</h3>
                            <p>
                                By accessing or using Course Matcher Pro, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the application.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">2. Description of Service</h3>
                            <p>
                                Course Matcher Pro is a collaborative tool designed to assist students in matching academic courses to real-world job descriptions. The platform helps analyze curriculum data alongside career advertisements to find optimal matching results through semantic search and AI analysis.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">3. User Registration and Access</h3>
                            <p>
                                Users may register via Email or GitHub authentication. By registering, you are responsible for maintaining the confidentiality of your account and all activities (such as saved history and custom course uploads) that occur under your profile. The administrator reserves the right to manage or revoke access based on service requirements.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">4. User Content and Public Visibility</h3>
                            <p>
                                By using the platform, you agree that:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Course Databases:</strong> Any curriculum databases, CSV, Excel, or JSON files uploaded will be processed and stored for matching analysis.</li>
                                <li><strong>Job Descriptions:</strong> Content pasted or uploaded for similarity search will be processed to extract key technical requirements.</li>
                                <li><strong>Conduct:</strong> You are solely responsible for the accuracy and legality of all files and text you upload.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">5. Data Privacy</h3>
                            <p>
                                We take your privacy seriously. Personal data collection is strictly limited to what is necessary for performing similarity search analysis, session management, and saved history logs.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">6. Third-Party Links</h3>
                            <p>
                                Course Matcher Pro integrates with and provides links to external services such as https://opas.peppi.oulu.fi. We are not responsible for the content, privacy policies, or practices of these third-party services. Accessing these links is at your own risk.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">7. Modifications</h3>
                            <p>
                                We reserve the right to update or modify these Terms & Conditions at any time. Continued use of the platform following any changes constitutes your acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">8. Governing Law</h3>
                            <p>
                                These Terms & Conditions are governed by the laws of Finland (or the jurisdiction in which the application is operated). Any disputes arising from the use of this tool shall be subject to the appropriate legal jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">9. Contact</h3>
                            <p>
                                If you have any questions about these Terms & Conditions, please contact us at:
                            </p>
                            <p className="mt-2 font-semibold text-[#1a5c55]">
                                hanna.saarela@oulu.fi
                            </p>
                        </section>
                        
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
