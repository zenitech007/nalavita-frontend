'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, CheckCircle2, Clock, ShieldCheck, AlertCircle,
    CalendarCheck, Activity, Info, CalendarDays, Check, Plus
} from 'lucide-react';
import AddMedicationModal from '@/components/AddMedicationModal';

// Mock Interfaces based on your Prisma Schema
interface Prescription {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    prescribedBy: string;
    dateAdded: string;
}

interface ScheduledMed {
    id: string;
    prescriptionId: string;
    name: string;
    dosage: string;
    scheduledTime: string;
    status: 'pending' | 'taken' | 'missed';
    timeTaken?: string;
    type?: string;
}

export default function PatientMedications() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // The "Source of Truth" added by the Hospital/Doctor
    const [prescriptions] = useState<Prescription[]>([
        {
            id: 'RX-101',
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            instructions: 'Take in the morning with or without food. May cause mild dizziness.',
            prescribedBy: 'Dr. Sarah Smith',
            dateAdded: 'Oct 12, 2025'
        },
        {
            id: 'RX-102',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            instructions: 'Take with meals to prevent stomach upset.',
            prescribedBy: 'Dr. Sarah Smith',
            dateAdded: 'Oct 12, 2025'
        }
    ]);

    // The Patient's Daily Actionable Schedule
    const [schedule, setSchedule] = useState<ScheduledMed[]>([
        {
            id: 'SCH-1',
            prescriptionId: 'RX-101',
            name: 'Lisinopril',
            dosage: '10mg',
            scheduledTime: '08:00 AM',
            status: 'pending'
        },
        {
            id: 'SCH-2',
            prescriptionId: 'RX-102',
            name: 'Metformin',
            dosage: '500mg',
            scheduledTime: '01:00 PM',
            status: 'pending'
        },
        {
            id: 'SCH-3',
            prescriptionId: 'RX-102',
            name: 'Metformin',
            dosage: '500mg',
            scheduledTime: '08:00 PM',
            status: 'pending'
        }
    ]);

    const handleAddNewMedication = async (newMed: any) => {
        // Here you would normally POST to your /api/patients/medications route
        // For now, let's update the local UI optimistically

        const newSchedules = newMed.scheduledTimes.map((time: string, index: number) => ({
            id: `SCH-NEW-${Date.now()}-${index}`,
            prescriptionId: `RX-SELF-${Date.now()}`,
            name: newMed.name,
            dosage: newMed.dosage,
            scheduledTime: time,
            status: 'pending',
            type: 'Self-Reported' // Distinguish it from Hospital meds
        }));

        setSchedule(prev => [...prev, ...newSchedules]);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    // Action: Patient marks a drug as taken
    const handleMarkTaken = async (scheduleId: string, medicationName: string) => {
        setIsSyncing(true);

        // 1. Get exact current time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 2. Optimistic UI Update (Change the UI instantly so it feels blazing fast)
        setSchedule(prev => prev.map(med =>
            med.id === scheduleId
                ? { ...med, status: 'taken', timeTaken: timeString }
                : med
        ));

        // 3. Actually Sync to Database
        try {
            const res = await fetch('/api/patients/medications/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scheduleId: scheduleId,
                    medicationName: medicationName,
                    timeTaken: timeString
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to sync with hospital database");
            }

            // Wait an extra half-second just so the user can read the "Syncing..." message
            setTimeout(() => setIsSyncing(false), 800);

        } catch (error) {
            console.error("Sync Error:", error);

            // If the database fails, revert the UI so they know it didn't save
            setSchedule(prev => prev.map(med =>
                med.id === scheduleId
                    ? { ...med, status: 'pending', timeTaken: undefined }
                    : med
            ));
            setIsSyncing(false);
            alert("Connection error: Failed to log medication. Please try again.");
        }
    };

    // Calculate Adherence (For the progress bar)
    const takenCount = schedule.filter(m => m.status === 'taken').length;
    const progressPercentage = schedule.length > 0 ? Math.round((takenCount / schedule.length) * 100) : 0;

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

            {/* --- HEADER & PROGRESS --- */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarCheck className="text-emerald-500" /> Today's Medications
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Mark your medications as taken to keep your doctor updated.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl hover:opacity-80 transition-opacity"
                        >
                            <Plus size={16} /> Add Medication
                        </button>

                        <div className="w-full sm:w-64 bg-gray-50 dark:bg-[#121315] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Daily Goal</span>
                                <span className="text-lg font-black text-emerald-500">{progressPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- SYNC INDICATOR --- */}
            <AnimatePresence>
                {isSyncing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-center gap-2 text-xs font-bold text-blue-500 bg-blue-500/10 py-2 rounded-xl border border-blue-500/20"
                    >
                        <Activity size={14} className="animate-spin" /> Syncing timestamp to Hospital Records...
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- LEFT: ACTIONABLE SCHEDULE --- */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 pl-2">
                        <Clock size={16} /> Action Required Today
                    </h3>

                    <div className="space-y-3">
                        {schedule.map((med) => (
                            <div key={med.id} className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${med.status === 'taken'
                                ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 shadow-sm'
                                : 'bg-white dark:bg-[#1E1F22] border-gray-200 dark:border-white/10 shadow-lg shadow-gray-200/20 dark:shadow-black/20'
                                }`}>

                                {med.status === 'taken' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                )}

                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${med.status === 'taken' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-gray-100 dark:bg-[#121315] text-gray-400'
                                            }`}>
                                            {med.status === 'taken' ? <Check size={24} /> : <Pill size={24} />}
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-bold ${med.status === 'taken' ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>
                                                {med.name} <span className="text-sm font-medium opacity-60">{med.dosage}</span>
                                            </h4>

                                            <div className="flex items-center gap-2 mt-1">
                                                {med.status === 'taken' ? (
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> Taken at {med.timeTaken}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                                        <Clock size={12} /> Scheduled for {med.scheduledTime}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {med.status !== 'taken' && (
                                        <button
                                            onClick={() => handleMarkTaken(med.id, med.name)}
                                            className="px-5 py-3 bg-linear-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 shrink-0"
                                        >
                                            Mark Taken
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* --- RIGHT: HOSPITAL PRESCRIPTIONS --- */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 pl-2">
                        <ShieldCheck size={16} /> Active Prescriptions
                    </h3>

                    <div className="bg-white dark:bg-[#1E1F22] rounded-3xl p-1 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 flex items-start gap-3 bg-blue-50/50 dark:bg-blue-500/5 rounded-t-[22px]">
                            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 dark:text-blue-300">
                                These medications were securely added to your file by your healthcare provider. <strong>You cannot edit this list directly.</strong> If a change is needed, please contact your doctor.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {prescriptions.map((rx) => (
                                <div key={rx.id} className="p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {rx.name} <span className="text-sm font-medium text-gray-500">{rx.dosage}</span>
                                            </h4>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FC94AF] bg-[#FC94AF]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                {rx.frequency}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4 pl-3 border-l-2 border-gray-200 dark:border-gray-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>Instructions:</strong> {rx.instructions}
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><ShieldCheck size={12} /> {rx.prescribedBy}</span>
                                            <span className="flex items-center gap-1"><CalendarDays size={12} /> Added {rx.dateAdded}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>

            <AddMedicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddNewMedication}
            />
        </motion.div>
    );
}