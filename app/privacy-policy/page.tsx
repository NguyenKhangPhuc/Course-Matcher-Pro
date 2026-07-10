'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export default function PrivacyPolicy() {
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
                    Privacy Policy
                </h1>

                <div className="bg-white rounded-2xl border border-[#d6edf5] p-6 sm:p-10 shadow-sm flex flex-col gap-6 text-[#1a2e35]">
                    
                    {/* Key Privacy Highlights Box */}
                    <section className="bg-[#e8faf8] border border-[#7dd8cc] rounded-xl p-5 sm:p-6 text-sm leading-relaxed">
                        <h2 className="text-base font-bold text-[#1a5c55] mb-2">Our Commitment to Privacy</h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#1a5c55] font-medium">
                            <li><strong>Self-Hosted Infrastructure:</strong> We run a self-hosted Supabase instance. Your data is stored entirely on our secured servers and never flows through external third-party database clouds like Supabase Cloud.</li>
                            <li><strong>Minimal Data Collection:</strong> We limit collection strictly to your username, full name, and email address.</li>
                            <li><strong>High Security & Isolation:</strong> Every account is secured and isolated using Row-Level Security (RLS). We never expose your personal account details to the public.</li>
                            <li><strong>GDPR Compliant:</strong> We strictly follow General Data Protection Regulation (GDPR) guidelines to respect and enforce your privacy rights.</li>
                        </ul>
                    </section>

                    {/* Policy Sections */}
                    <div className="flex flex-col gap-6 text-sm sm:text-[15px] text-[#6b9daa] leading-relaxed">
                        
                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">1. Data Controller</h3>
                            <p>
                                The Course Matcher Pro team acts as the Data Controller for the personal data processed within this platform. We manage and operate our infrastructure independently to maintain complete control over data integrity.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">2. Information We Collect</h3>
                            <p>
                                To provide our course matching services while ensuring data minimization, we only collect and process the following fields:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Username:</strong> For authentication and user handle references.</li>
                                <li><strong>Full Name:</strong> To personalize your account dashboard.</li>
                                <li><strong>Email Address:</strong> For authentication, registration, security updates, and session management.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">3. Purpose of Processing</h3>
                            <p>
                                Collected data is processed strictly to manage user accounts, record individual search histories, and execute course recommendation algorithms. We do not sell, rent, or share your account information or email addresses with external parties for marketing or any other commercial purposes.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">4. Legal Basis (GDPR Compliance)</h3>
                            <p>
                                We process your data based on your explicit consent provided during authentication (via Email or GitHub integration). You have the right to withdraw your consent and request the permanent erasure of your account details at any time by deleting your profile.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">5. Data Storage and Security</h3>
                            <p>
                                Because privacy is paramount, we self-host our database system using Supabase:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1.5">
                                <li><strong>No Third-Party Clouds:</strong> Data is hosted directly within our self-hosted architecture inside the European Union (EU), bypassing Supabase Cloud entirely.</li>
                                <li><strong>Data Isolation:</strong> We leverage PostgreSQL Row Level Security (RLS) to enforce strict rules, ensuring that users can only read or write their own authorized data.</li>
                                <li><strong>Encryption & Maintenance:</strong> We implement TLS/SSL encryption protocols for all data in transit. Regular security updates are applied to keep the self-hosted environment protected against vulnerabilities.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">6. Your Rights</h3>
                            <p>
                                Under the General Data Protection Regulation (GDPR), you possess the following core rights:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1.5">
                                <li><strong>Access & Portability:</strong> The right to request a copy of the data we store.</li>
                                <li><strong>Rectification:</strong> The right to update or correct your profile details.</li>
                                <li><strong>Erasure:</strong> The right to request the complete deletion of your account and related search history (&quot;Right to be Forgotten&quot;).</li>
                                <li><strong>Objection & Restriction:</strong> The right to object to specific data processing actions.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">7. Contact Information</h3>
                            <p>
                                For any inquiries regarding data privacy or to exercise your GDPR rights, please contact the team at:
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
