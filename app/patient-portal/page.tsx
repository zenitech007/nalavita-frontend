'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Activity, Bell, CheckCircle2,
    AlertTriangle, ChevronRight, Sparkles, ShieldCheck,
    WifiOff, UserPlus, Clock, ArrowUpRight, ArrowDownRight,
    MessageCircle, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRealtimePatient } from '@/hooks/useRealtimePatient';

export default function PatientDashboard() {
    const router = useRouter();
    const {
        patient,
        medications,
        vitals,
        loading: isLoading,
        setMedications
    } = useRealtimePatient();

    const [healthScore, setHealthScore] = useState(92); // Set fallback to 92 (based on original fetch update)
    const [isOffline] = useState(false);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        // --- THE BOUNCER FIX ---
        // If they are missing vital setup info, force them to the onboarding page!
        if (!isLoading && patient) {
            if (!patient.heightCm || !patient.weightKg || !patient.gender) {
                router.push('/onboarding');
                return; // Stop rendering the dashboard
            }

            // Mocking a health score based on completeness of profile
            setHealthScore(92);
        }
    }, [isLoading, patient, router]);

    const handleTakeMedication = async (id: string, name: string) => {
        // ⚡ Instant UI update
        setMedications((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, status: 'taken' } : m
            )
        );

        try {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;

            await fetch('/api/patients/me/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    medsTaken: true,
                    notes: `${name} taken`,
                }),
            });

            // ✅ No manual refresh needed → realtime handles it

        } catch (err) {
            console.error(err);

            // 🔁 rollback if failed
            setMedications((prev) =>
                prev.map((m) =>
                    m.id === id ? { ...m, status: 'pending' } : m
                )
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-[#FC94AF]">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-500">Loading your health dashboard...</p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
                <p className="text-sm text-gray-500">Please complete your onboarding setup.</p>
            </div>
        );
    }

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

            {/* Top Banner */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div className="flex items-center gap-3 bg-white dark:bg-[#1E1F22] px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-white/5">
                    <UserPlus size={16} className="text-blue-500" />
                    <span className="text-xs font-semibold">Caregiver Mode: <span className="text-gray-500 font-medium">Monitored by Caregiver</span></span>
                </div>
                <div className="flex items-center gap-4">
                    {isLive && (
                        <div className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            LIVE
                        </div>
                    )}
                    {isOffline ? (
                        <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full text-xs font-bold border border-amber-500/20">
                            <WifiOff size={14} /> Offline Mode - Changes will sync later
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20">
                            <CheckCircle2 size={14} /> Synced with Hospital Network
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-linear-to-br from-[#FC94AF]/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Activity size={20} className="text-[#FC94AF]" /> Personal Health Insights</h2>
                                <p className="text-xs text-gray-500 mt-1">AI Trend Analysis based on your last 7 days.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#FC94AF] to-purple-500">
                                    {healthScore}
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Health Score</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-gray-50 dark:bg-[#14151A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Blood Pressure</span>
                                    <ArrowUpRight size={16} className="text-amber-500" />
                                </div>
                                {/* DATA BINDING HERE */}
                                <div className="text-xl font-bold">{vitals.bp}</div>
                                <p className="text-xs text-amber-500 mt-1 font-medium">Tracked from your daily log.</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#14151A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Resting HR</span>
                                    <ArrowDownRight size={16} className="text-emerald-500" />
                                </div>
                                {/* DATA BINDING HERE */}
                                <div className="text-xl font-bold">{vitals.hr} <span className="text-sm font-normal text-gray-400">bpm</span></div>
                                <p className="text-xs text-emerald-500 mt-1 font-medium">Tracked from your daily log.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Medications Widget */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2"><Pill size={20} className="text-[#FC94AF]" /> Smart Medications</h2>
                                <p className="text-xs text-gray-500 mt-1">Your prescribed adherence list.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {medications.length === 0 ? (
                                <p className="text-sm text-gray-500 bg-gray-50 dark:bg-[#14151A] p-4 rounded-xl text-center border border-gray-100 dark:border-gray-800">No active medications loaded.</p>
                            ) : (
                                <AnimatePresence>
                                    {medications.map((med) => (
                                        <motion.div key={med.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${med.status === 'taken' ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' : 'bg-gray-50 dark:bg-[#14151A] border-gray-100 dark:border-gray-800'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${med.status === 'taken' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-[#1E1F22] shadow-sm'}`}>
                                                    {med.status === 'taken' ? <CheckCircle2 size={20} /> : <Pill size={20} className="text-gray-400" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{med.name} <span className="text-gray-500 font-normal">{med.dose}</span></h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock size={12} className="text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-500">{med.time}</span>
                                                        <span className="text-[10px] uppercase bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{med.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {med.status !== 'taken' && (
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"><Bell size={18} /></button>
                                                    <button onClick={() => handleTakeMedication(med.id, med.name)} className="px-4 py-2 bg-[#FC94AF] hover:bg-[#E07A96] text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-[#FC94AF]/20">Mark Taken</button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                        <h2 className="text-base font-bold flex items-center gap-2 mb-4"><ShieldCheck size={18} className="text-blue-500" /> Verified Record Updates</h2>
                        <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#1E1F22]"></div>
                                <h4 className="text-sm font-bold">Lab Results</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Awaiting your next scheduled blood test.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-linear-to-br from-[#FC94AF] to-purple-500 rounded-3xl p-6 shadow-xl shadow-[#FC94AF]/20 text-white relative overflow-hidden group cursor-pointer" onClick={() => window.location.href = '/patient-portal/chat'}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <MessageCircle size={32} className="mb-4 opacity-80" />
                        <h2 className="text-xl font-bold mb-2">Daily Check-in</h2>
                        <p className="text-sm text-white/80 mb-6 leading-relaxed">Amelia AI is ready to triage symptoms, explain your meds, or summarize your last visit.</p>
                        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">Start Chat <ChevronRight size={14} /></div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}