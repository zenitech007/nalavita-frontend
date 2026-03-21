'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    UserRound,
    ArrowRight,
    HeartPulse,
    Phone,
    Mail,
    ChevronDown,
    FileEdit,
    ScanLine,
    ArrowUpDown,
    MoreVertical,
    ActivitySquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatients } from '@/hooks/usePatients';
import { createClient } from '@/lib/supabaseClient';
import AddPatientModal from '@/components/modals/AddPatientModal';
import UploadPatientModal from '@/components/modals/UploadPatientModal';

export default function PatientDirectory() {
    const router = useRouter();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [doctorId, setDoctorId] = useState<string | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [scannedData, setScannedData] = useState<any>(null);

    // Advanced Search & Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [triageFilter, setTriageFilter] = useState('All');

    // Sorting
    const [sortField, setSortField] = useState<'name' | 'age' | 'status' | 'triage' | 'updatedAt'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) setDoctorId(session.user.id);
        };
        getUser();

        // Close dropdown on outside click
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAddMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [supabase]);

    // Assume hook returns patients matching your updated Prisma schema
    const { patients, isLoading, formatLastVisit, refetch } = usePatients(doctorId);

    // 1. Filter Logic (Wide Range Search)
    const filteredPatients = patients.filter((patient) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            patient.firstName?.toLowerCase().includes(query) ||
            patient.lastName?.toLowerCase().includes(query) ||
            patient.email?.toLowerCase().includes(query) ||
            patient.phone?.includes(query) ||
            patient.department?.toLowerCase().includes(query) ||
            patient.nokName?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
        const matchesTriage = triageFilter === 'All' || patient.triageLevel === triageFilter;

        return matchesSearch && matchesStatus && matchesTriage;
    });

    // 2. Sort Logic
    const sortedPatients = [...filteredPatients].sort((a, b) => {
        let valA: any;
        let valB: any;

        // Custom field mapping for sorting
        if (sortField === 'name') {
            valA = `${a.firstName} ${a.lastName}`.toLowerCase();
            valB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortField === 'triage') {
            const triageWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
            valA = triageWeight[a.triageLevel as keyof typeof triageWeight] || 0;
            valB = triageWeight[b.triageLevel as keyof typeof triageWeight] || 0;
        } else {
            // Safely cast for standard fields like 'status' or 'updatedAt'
            valA = a[sortField as keyof typeof a];
            valB = b[sortField as keyof typeof b];
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Styling Maps
    const triageStyles = {
        High: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
        Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
        Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
    };

    const statusStyles = {
        Critical: 'text-red-500 flex items-center gap-1.5',
        Stable: 'text-emerald-500 flex items-center gap-1.5',
        'Review Needed': 'text-amber-500 flex items-center gap-1.5',
        Discharged: 'text-gray-400 flex items-center gap-1.5'
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-10 min-h-screen text-gray-900 dark:text-gray-100">

            {/* Header section with floating effects */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6"
            >
                <div className="relative">
                    <div className="absolute -inset-1 bg-linear-to-r from-[#FC94AF] to-purple-500 rounded-full blur opacity-20 dark:opacity-40 animate-pulse"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-[#1E1F22] rounded-2xl shadow-xl shadow-[#FC94AF]/10 border border-white/20 dark:border-white/5">
                            <UserRound className="text-[#FC94AF]" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {patients.length} total registered patients
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dropdown Add Button */}
                <div className="relative z-50" ref={dropdownRef}>
                    <button
                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                        className="group relative flex items-center gap-2 bg-[#FC94AF] hover:bg-[#E07A96] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#FC94AF]/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <span className="font-semibold">Add Patient</span>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isAddMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1E1F22] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden backdrop-blur-xl"
                            >
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { setIsModalOpen(true); setIsAddMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2B2F] transition-colors"
                                    >
                                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><FileEdit size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold">Manual Entry</p>
                                            <p className="text-xs text-gray-500">Fill out intake form</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => { setIsUploadModalOpen(true); setIsAddMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2B2F] transition-colors"
                                    >
                                        <div className="bg-[#FC94AF]/10 p-2 rounded-lg text-[#FC94AF]"><ScanLine size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold">Scan / Document</p>
                                            <p className="text-xs text-gray-500">Auto-fill via Amelia AI</p>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Search + Filters (Glassmorphism) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white/70 dark:bg-[#1E1F22]/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row gap-4"
            >
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FC94AF] transition-colors" size={18} />
                    <input
                        placeholder="Search name, phone, email, contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100/50 dark:bg-[#121315]/50 border border-transparent focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-[#121315] focus:outline-none focus:ring-4 focus:ring-[#FC94AF]/10 transition-all text-sm"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                    <div className="relative shrink-0 flex items-center">
                        <Filter size={16} className="absolute left-3 text-gray-400" />
                        <select
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-3 rounded-xl bg-gray-100/50 dark:bg-[#121315]/50 border border-transparent focus:border-[#FC94AF]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Stable">Stable</option>
                            <option value="Review Needed">Review Needed</option>
                            <option value="Critical">Critical</option>
                            <option value="Discharged">Discharged</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                    </div>

                    <div className="relative shrink-0 flex items-center">
                        <ActivitySquare size={16} className="absolute left-3 text-gray-400" />
                        <select
                            onChange={(e) => setTriageFilter(e.target.value)}
                            className="pl-9 pr-8 py-3 rounded-xl bg-gray-100/50 dark:bg-[#121315]/50 border border-transparent focus:border-[#FC94AF]/50 focus:outline-none text-sm appearance-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <option value="All">All Priorities</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </motion.div>

            {/* Desktop Table */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="hidden md:block bg-white/70 dark:bg-[#1E1F22]/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
            >
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 dark:bg-[#121315]/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="p-5 cursor-pointer hover:text-[#FC94AF] transition-colors" onClick={() => toggleSort('name')}>
                                <div className="flex items-center gap-2">Patient <ArrowUpDown size={14} className={sortField === 'name' ? 'text-[#FC94AF]' : 'opacity-50'} /></div>
                            </th>
                            <th className="p-5">Contact Info</th>
                            <th className="p-5">Vitals / Physical</th>
                            <th className="p-5 cursor-pointer hover:text-[#FC94AF] transition-colors" onClick={() => toggleSort('status')}>
                                <div className="flex items-center gap-2">Status <ArrowUpDown size={14} className={sortField === 'status' ? 'text-[#FC94AF]' : 'opacity-50'} /></div>
                            </th>
                            <th className="p-5 cursor-pointer hover:text-[#FC94AF] transition-colors" onClick={() => toggleSort('triage')}>
                                <div className="flex items-center gap-2">Triage <ArrowUpDown size={14} className={sortField === 'triage' ? 'text-[#FC94AF]' : 'opacity-50'} /></div>
                            </th>
                            <th className="p-5"></th>
                        </tr>
                    </thead>

                    <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {sortedPatients.map((p) => (
                            <motion.tr
                                variants={itemVariants}
                                key={p.id}
                                onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                                className="hover:bg-gray-50 dark:hover:bg-[#2A2B2F] cursor-pointer transition-all duration-200 group relative"
                            >
                                <td className="p-5">
                                    <p className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-[#FC94AF] transition-colors">{p.firstName} {p.lastName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {p.age ? `${p.age} yrs` : 'N/A'} • {p.gender || 'Unknown'} • {p.bloodType || 'Blood ??'}
                                    </p>
                                </td>

                                <td className="p-5 space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Phone size={12} className="text-gray-400" /> {p.phone || 'No phone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Mail size={12} className="text-gray-400" /> {p.email || 'No email'}
                                    </div>
                                </td>

                                <td className="p-5">
                                    <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1.5"><HeartPulse size={12} className="text-[#FC94AF]" /> BP: <span className="font-medium">{p.bp || '--'}</span> | HR: <span className="font-medium">{p.hr || '--'}</span></div>
                                        <div className="text-gray-500">{p.heightCm ? `${p.heightCm}cm` : '--'} • {p.weightKg ? `${p.weightKg}kg` : '--'}</div>
                                    </div>
                                </td>

                                <td className="p-5">
                                    <div className={statusStyles[p.status as keyof typeof statusStyles] || statusStyles['Stable']}>
                                        <div className={`w-2 h-2 rounded-full ${p.status === 'Critical' ? 'bg-red-500 animate-pulse' : p.status === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        <span className="font-medium">{p.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 pl-3.5">{p.department || 'General Dept'}</p>
                                </td>

                                <td className="p-5">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${triageStyles[p.triageLevel as keyof typeof triageStyles] || triageStyles['Low']}`}>
                                        {p.triageLevel} Priority
                                    </span>
                                </td>

                                <td className="p-5 text-right">
                                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-[#FC94AF] group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        {sortedPatients.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-500">
                                    No patients found matching your search criteria.
                                </td>
                            </tr>
                        )}
                    </motion.tbody>
                </table>
            </motion.div>

            {/* Mobile Cards (Floating Design) */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="md:hidden space-y-4">
                {sortedPatients.map((p) => (
                    <motion.div
                        variants={itemVariants}
                        key={p.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                        className="bg-white/80 dark:bg-[#1E1F22]/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 space-y-3 relative overflow-hidden"
                    >
                        {/* Decorative background glow for critical patients */}
                        {p.status === 'Critical' && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />}

                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {p.firstName} {p.lastName}
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">
                                    {p.age ? `${p.age} yrs` : 'N/A'} • {p.gender} • Dept: {p.department || 'General'}
                                </p>
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${triageStyles[p.triageLevel as keyof typeof triageStyles] || triageStyles['Low']}`}>
                                {p.triageLevel}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                <Phone size={12} className="text-[#FC94AF]" /> <span className="truncate">{p.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                <HeartPulse size={12} className="text-[#FC94AF]" /> BP: {p.bp || '--'}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <div className={statusStyles[p.status as keyof typeof statusStyles] || statusStyles['Stable']}>
                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Critical' ? 'bg-red-500' : p.status === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                <span className="font-semibold text-xs">{p.status}</span>
                            </div>

                            <button className="bg-gray-100 dark:bg-[#2A2B2F] p-1.5 rounded-lg text-gray-500 hover:text-[#FC94AF] transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Manual Entry Form */}
            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setScannedData(null); // Clear data on close
                }}
                onSuccess={() => {
                    refetch();
                    setScannedData(null);
                }}
                doctorId={doctorId || ''}
                initialData={scannedData} // Pass the AI data here!
            />

            {/* AI Document Scanner */}
            <UploadPatientModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                doctorId={doctorId || ''}
                onSuccess={(extractedData) => {
                    setScannedData(extractedData); // Save the data
                    setIsModalOpen(true);          // Immediately open the Add form
                }}
            />
        </div>
    );
}