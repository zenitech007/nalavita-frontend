'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Video, Plus, User,
    FileText, CalendarX2, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function PatientAppointments() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch('/api/patients/appointments');
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setAppointments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Helper functions to split the data
    const upcoming = appointments.filter(apt => apt.status === 'Scheduled' || apt.status === 'Confirmed');
    const past = appointments.filter(apt => apt.status === 'Completed' || apt.status === 'Cancelled');

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC94AF]"></div>
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="text-[#FC94AF]" /> Appointments
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your upcoming clinic visits and telehealth calls.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#FC94AF] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#E07A96] hover:shadow-lg hover:shadow-[#FC94AF]/30 transition-all shrink-0">
                    <Plus size={18} /> Book Appointment
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* UPCOMING APPOINTMENTS */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Upcoming Visits</h3>

                    {upcoming.map((apt, index) => (
                        <motion.div variants={itemVariants} key={apt.id} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 relative overflow-hidden group">

                            {/* Decorative background glow for the very next appointment */}
                            {index === 0 && (
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-linear-to-br from-[#FC94AF]/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                {/* Date/Time Block */}
                                <div className="md:w-48 shrink-0 bg-gray-50 dark:bg-[#121315] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center">
                                    <span className="text-sm font-bold text-[#FC94AF] uppercase tracking-wider mb-1">{apt.date?.split(' ')[0] || 'TBD'}</span>
                                    <span className="text-3xl font-black text-gray-900 dark:text-white mb-1">{apt.date?.split(' ')[1]?.replace(',', '') || ''}</span>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mt-2 bg-white dark:bg-[#1E1F22] px-3 py-1 rounded-full shadow-sm">
                                        <Clock size={14} /> {apt.time}
                                    </div>
                                </div>

                                {/* Details Block */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{apt.doctor}</h2>
                                            <p className="text-sm text-gray-500 font-medium">{apt.specialty}</p>
                                        </div>
                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <CheckCircle2 size={12} /> {apt.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {apt.type === 'Telehealth' ? (
                                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-500/10 w-fit px-3 py-1.5 rounded-lg">
                                                <Video size={16} /> Telehealth Video Call
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <MapPin size={16} className="text-gray-400" /> {apt.location}
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#121315] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                            <p>{apt.notes}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-3">
                                        {apt.type === 'Telehealth' ? (
                                            <button className="flex-1 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2">
                                                <Video size={16} /> Join Call
                                            </button>
                                        ) : (
                                            <button className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2.5 rounded-xl hover:opacity-80 transition-opacity text-sm">
                                                Get Directions
                                            </button>
                                        )}
                                        <button className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm">
                                            Reschedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* PAST APPOINTMENTS */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Past History</h3>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E1F22] rounded-3xl p-5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5">
                        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                            {past.map(apt => (
                                <div key={apt.id} className="pt-4 first:pt-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{apt.doctor}</h4>
                                            <p className="text-xs text-gray-500">{apt.date}</p>
                                        </div>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                                            {apt.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#121315] p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                        {apt.summary}
                                    </p>
                                    <button className="w-full mt-3 text-xs font-bold text-[#FC94AF] flex items-center justify-center gap-1 hover:underline">
                                        View Clinical Notes <ChevronRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}