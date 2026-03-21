'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, ShieldCheck, AlertTriangle, UploadCloud,
    Calendar, Stethoscope, ChevronDown, CheckCircle2,
    Clock, Search, Filter, ShieldAlert, Send
} from 'lucide-react';

// Mock Data Types
type RecordStatus = 'Verified' | 'Unverified' | 'Correction Pending';
type RecordType = 'Visit' | 'Lab Result' | 'Prescription' | 'External Upload';

interface MedicalRecord {
    id: string;
    title: string;
    provider: string;
    date: string;
    type: RecordType;
    status: RecordStatus;
    details: string;
    flaggedError?: string;
}

export default function PatientRecords() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
    const [flaggingRecord, setFlaggingRecord] = useState<string | null>(null);
    const [errorNote, setErrorNote] = useState('');

    // Mock Database
    const [records, setRecords] = useState<MedicalRecord[]>([
        {
            id: 'REC-001',
            title: 'Complete Blood Count (CBC)',
            provider: 'Amelia MedTech Central Lab',
            date: 'Oct 24, 2025',
            type: 'Lab Result',
            status: 'Verified',
            details: 'All markers within normal range. Hemoglobin: 14.2 g/dL, WBC: 6.5 x10^9/L.'
        },
        {
            id: 'REC-002',
            title: 'Cardiology Consultation',
            provider: 'Dr. Sarah Smith',
            date: 'Sep 12, 2025',
            type: 'Visit',
            status: 'Correction Pending',
            details: 'Patient reported occasional palpitations. BP measured at 135/85. Prescribed Lisinopril 10mg.',
            flaggedError: 'The notes say I am taking Lisinopril 10mg, but my dosage was reduced to 5mg last month.'
        },
        {
            id: 'REC-003',
            title: 'Previous Clinic History (PDF)',
            provider: 'Uploaded by Patient',
            date: 'Aug 05, 2025',
            type: 'External Upload',
            status: 'Unverified',
            details: 'Scanned document of medical history from St. Jude Hospital (2020-2024).'
        }
    ]);

    const handleFlagError = (id: string) => {
        if (!errorNote.trim()) return;

        setRecords(prev => prev.map(rec =>
            rec.id === id
                ? { ...rec, status: 'Correction Pending', flaggedError: errorNote }
                : rec
        ));

        setFlaggingRecord(null);
        setErrorNote('');
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

            {/* --- HEADER & UPLOAD ACTION --- */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-[#FC94AF]" /> Unified Medical Record
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Your complete health timeline across all verified providers.</p>
                </div>

                <button className="flex items-center gap-2 bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all shrink-0">
                    <UploadCloud size={18} /> Upload External Record
                </button>
            </motion.div>

            {/* --- SEARCH & FILTERS --- */}
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-[#1E1F22]/80 backdrop-blur-xl p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FC94AF] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by hospital, doctor, or condition..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#121315] border border-transparent focus:border-[#FC94AF]/50 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#FC94AF]/10 transition-all dark:text-white"
                    />
                </div>
                <button className="px-4 py-3 bg-gray-50 dark:bg-[#121315] hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-colors">
                    <Filter size={16} /> Filter
                </button>
            </motion.div>

            {/* --- TIMELINE --- */}
            <div className="relative pl-4 sm:pl-8 py-4">
                {/* Vertical Timeline Line */}
                <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800/60 rounded-full"></div>

                <div className="space-y-8">
                    {records.map((record) => (
                        <motion.div variants={itemVariants} key={record.id} className="relative pl-8 sm:pl-10">

                            {/* Timeline Dot */}
                            <div className={`absolute -left-5.25 sm:-left-6.25 top-1.5 w-4 h-4 rounded-full border-4 border-gray-50 dark:border-[#0A0B0D] z-10 ${record.status === 'Verified' ? 'bg-emerald-500' :
                                record.status === 'Correction Pending' ? 'bg-amber-500' : 'bg-gray-400'
                                }`} />

                            {/* Record Card */}
                            <div className="bg-white dark:bg-[#1E1F22] rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-200/20 dark:shadow-black/20 overflow-hidden">

                                {/* Card Header (Clickable) */}
                                <div
                                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                                    className="p-5 sm:p-6 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors flex flex-col sm:flex-row justify-between items-start gap-4"
                                >
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                                <Calendar size={14} /> {record.date}
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">•</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                {record.type}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {record.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                            <Stethoscope size={14} /> {record.provider}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {record.status === 'Verified' && (
                                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-bold">
                                                <ShieldCheck size={14} /> Verified
                                            </span>
                                        )}
                                        {record.status === 'Unverified' && (
                                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                                <Clock size={14} /> Pending Review
                                            </span>
                                        )}
                                        {record.status === 'Correction Pending' && (
                                            <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                                                <AlertTriangle size={14} /> Correction Pending
                                            </span>
                                        )}
                                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedRecord === record.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded Content Area */}
                                <AnimatePresence>
                                    {expandedRecord === record.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-[#121315]/30"
                                        >
                                            <div className="p-5 sm:p-6 space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-white dark:bg-[#1E1F22] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                                        {record.details}
                                                    </p>
                                                </div>

                                                {/* Existing Flagged Error Display */}
                                                {record.flaggedError && (
                                                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl">
                                                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-1.5 mb-1">
                                                            <ShieldAlert size={14} /> Error Reported to Clinic
                                                        </h4>
                                                        <p className="text-sm text-amber-800 dark:text-amber-400/80">
                                                            "{record.flaggedError}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-2">
                                                    <button className="px-4 py-2 bg-white dark:bg-[#1E1F22] border border-gray-200 dark:border-white/10 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                                                        View Full Document
                                                    </button>

                                                    {record.status === 'Verified' && flaggingRecord !== record.id && (
                                                        <button
                                                            onClick={() => setFlaggingRecord(record.id)}
                                                            className="px-4 py-2 text-[#FC94AF] bg-[#FC94AF]/10 border border-[#FC94AF]/20 text-sm font-bold rounded-xl hover:bg-[#FC94AF] hover:text-white transition-all shadow-sm"
                                                        >
                                                            Flag an Error
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Flag Error Input Area (Slides down when button clicked) */}
                                                <AnimatePresence>
                                                    {flaggingRecord === record.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                                                            className="mt-4 p-4 bg-white dark:bg-[#1E1F22] border border-[#FC94AF]/30 rounded-2xl shadow-lg shadow-[#FC94AF]/5"
                                                        >
                                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is incorrect in this record?</h4>
                                                            <textarea
                                                                value={errorNote}
                                                                onChange={(e) => setErrorNote(e.target.value)}
                                                                placeholder="E.g., The medication dosage listed here is incorrect. It should be 5mg."
                                                                className="w-full bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 focus:border-[#FC94AF]/50 focus:ring-4 focus:ring-[#FC94AF]/10 rounded-xl p-3 text-sm focus:outline-none transition-all dark:text-white resize-none h-24 mb-3"
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setFlaggingRecord(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleFlagError(record.id)}
                                                                    disabled={!errorNote.trim()}
                                                                    className="flex items-center gap-2 px-5 py-2 bg-[#FC94AF] text-white text-sm font-bold rounded-xl hover:bg-[#E07A96] transition-colors shadow-md disabled:opacity-50"
                                                                >
                                                                    <Send size={14} /> Submit Correction
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </motion.div>
    );
}