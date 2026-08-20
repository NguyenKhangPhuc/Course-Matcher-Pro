'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export default function PrivacyPolicy() {
    const { language } = useLanguage();
    const t = translations[language.language] || translations.en;

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
                    <span>{t.privacyPolicy.backHome}</span>
                </Link>

                {/* Page Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a5c55] leading-tight tracking-[-0.02em] mb-6">
                    {t.privacyPolicy.title}
                </h1>

                <div className="bg-white rounded-2xl border border-[#d6edf5] p-6 sm:p-10 shadow-sm flex flex-col gap-6 text-[#1a2e35]">
                    
                    {/* Key Privacy Highlights Box */}
                    <section className="bg-[#e8faf8] border border-[#7dd8cc] rounded-xl p-5 sm:p-6 text-sm leading-relaxed">
                        <h2 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.commitmentTitle}</h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#1a5c55] font-medium">
                            <li><strong>{t.privacyPolicy.item1Title}</strong>{t.privacyPolicy.item1Body}</li>
                            <li><strong>{t.privacyPolicy.item2Title}</strong>{t.privacyPolicy.item2Body}</li>
                            <li><strong>{t.privacyPolicy.item3Title}</strong>{t.privacyPolicy.item3Body}</li>
                            <li><strong>{t.privacyPolicy.item4Title}</strong>{t.privacyPolicy.item4Body}</li>
                        </ul>
                    </section>

                    {/* Policy Sections */}
                    <div className="flex flex-col gap-6 text-sm sm:text-[15px] text-[#6b9daa] leading-relaxed">
                        
                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec1Title}</h3>
                            <p>
                                {t.privacyPolicy.sec1Body}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec2Title}</h3>
                            <p>
                                {t.privacyPolicy.sec2Body}
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Username:</strong> For authentication and user handle references.</li>
                                <li><strong>Full Name:</strong> To personalize your account dashboard.</li>
                                <li><strong>Email Address:</strong> For authentication, registration, security updates, and session management.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec3Title}</h3>
                            <p>
                                {t.privacyPolicy.sec3Body}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec4Title}</h3>
                            <p>
                                {t.privacyPolicy.sec4Body}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec5Title}</h3>
                            <p>
                                {t.privacyPolicy.sec5Body}
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1.5">
                                <li><strong>No Third-Party Clouds:</strong> Data is hosted directly within our self-hosted architecture inside the European Union (EU), bypassing Supabase Cloud entirely.</li>
                                <li><strong>Data Isolation:</strong> We leverage PostgreSQL Row Level Security (RLS) to enforce strict rules, ensuring that users can only read or write their own authorized data.</li>
                                <li><strong>Encryption & Maintenance:</strong> We implement TLS/SSL encryption protocols for all data in transit. Regular security updates are applied to keep the self-hosted environment protected against vulnerabilities.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec6Title}</h3>
                            <p>
                                {t.privacyPolicy.sec6Body}
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1.5">
                                <li><strong>Access & Portability:</strong> The right to request a copy of the data we store.</li>
                                <li><strong>Rectification:</strong> The right to update or correct your profile details.</li>
                                <li><strong>Erasure:</strong> The right to request the complete deletion of your account and related search history (&quot;Right to be Forgotten&quot;).</li>
                                <li><strong>Objection & Restriction:</strong> The right to object to specific data processing actions.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-base font-bold text-[#1a5c55] mb-2">{t.privacyPolicy.sec7Title}</h3>
                            <p>
                                {t.privacyPolicy.sec7Body}
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
