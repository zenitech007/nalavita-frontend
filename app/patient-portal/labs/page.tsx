'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, FileText, Download, ShieldCheck, AlertCircle, 
    TrendingUp, TrendingDown, Sparkles, Beaker, ChevronRight 
} from 'lucide-react';

export default function PatientLabs() {
    const [labs] = useState([
        {
            id: 'LAB-001',
            name: 'Complete Blood Count (CBC)',
            date: 'Oct 24, 2025',
            doctor: 'Dr. Sarah Smith',
            status: 'Reviewed',
            markers: [
                { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.8 - 17.2', status: 'normal' },
                { name: 'WBC Count', value: '6.5', unit: 'x10^9/L', range: '4.5 - 11.0', status: 'normal' },
            ],
            aiSummary: "Your Complete Blood Count looks great. Your Hemoglobin and White Blood Cell levels are well within the healthy range, indicating no signs of anemia or current infection."
        },
        {
            id: 'LAB-002',
            name: 'Lipid Panel (Cholesterol)',
            date: 'Sep 10, 2025',
            doctor: 'Dr. Sarah Smith',
            status: 'Action Required',
            markers: [
                { name: 'Total Cholesterol', value: '215', unit: 'mg/dL', range: '< 200', status: 'high' },
                { name: 'HDL (Good)', value: '45', unit: 'mg/dL', range: '> 40', status: 'normal' },
                { name: 'LDL (Bad)', value: '140', unit: 'mg/dL', range: '< 100', status: 'high' },
            ],
            aiSummary: "Your Total Cholesterol and LDL ('bad' cholesterol) are slightly elevated above the ideal range. Dr. Smith has noted this and recommends continuing your current exercise routine and maintaining a low-saturated-fat diet."
        }
    ]);

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
            
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Beaker className="text-[#FC94AF]" /> Lab Results
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">View your test results, translated by Amelia AI.</p>
                </div>
            </motion.div>

            <div className="space-y-6">
                {labs.map((lab) => (
                    <motion.div variants={itemVariants} key={lab.id} className="bg-white dark:bg-[#1E1F22] rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden">
                        
                        {/* Lab Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lab.name}</h2>
                                    {lab.status === 'Reviewed' ? (
                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                                            <ShieldCheck size={12} /> Doctor Reviewed
                                        </span>
                                    ) : (
                                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-500/20 animate-pulse">
                                            <AlertCircle size={12} /> Action Needed
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="font-semibold">{lab.date}</span> • Ordered by {lab.doctor}
                                </p>
                            </div>
                            
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <Download size={16} /> PDF Report
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-50/30 dark:bg-[#14151A]/30">
                            
                            {/* Raw Metrics Table */}
                            <div className="lg:col-span-2 space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Biomarkers</h3>
                                <div className="space-y-2">
                                    {lab.markers.map((marker, i) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#1E1F22] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {marker.name}
                                                    {marker.status === 'high' && <TrendingUp size={14} className="text-red-500" />}
                                                    {marker.status === 'low' && <TrendingDown size={14} className="text-blue-500" />}
                                                </h4>
                                                <p className="text-xs text-gray-500">Standard Range: {marker.range} {marker.unit}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-lg font-black ${marker.status === 'normal' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {marker.value}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">{marker.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amelia AI Summary (The Killer Feature) */}
                            <div className="lg:col-span-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Amelia AI Translation</h3>
                                <div className="h-full min-h-37.5 bg-linear-to-br from-[#FC94AF]/10 to-purple-500/10 border border-[#FC94AF]/20 rounded-2xl p-5 relative overflow-hidden flex flex-col">
                                    <Sparkles size={80} className="absolute -right-4 -top-4 text-[#FC94AF] opacity-10 pointer-events-none" />
                                    <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <div className="bg-[#FC94AF] p-1.5 rounded-lg text-white">
                                            <Activity size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">What this means</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
                                        {lab.aiSummary}
                                    </p>
                                    <button className="mt-auto pt-4 text-xs font-bold text-[#FC94AF] flex items-center gap-1 hover:underline w-fit">
                                        Discuss this with Amelia <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>

        </motion.div>
    );
}