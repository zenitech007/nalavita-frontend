'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, AlertCircle, Activity, Stethoscope, ArrowUpRight, Plus } from 'lucide-react';
import PatientIntakeChart from '@/components/charts/PatientIntakeChart';
import AddPatientModal from '@/components/modals/AddPatientModal';
import { usePatients } from '@/hooks/usePatients';
import { createClient } from '@/lib/supabaseClient';

const ACTIVITY_FEED = [
    { id: 1, text: "A.M.E.L.I.A flagged potential drug interaction for Sarah Smith.", time: "10 min ago", type: "alert" },
    { id: 2, text: "New lab results uploaded for Michael Johnson.", time: "1 hr ago", type: "info" },
    { id: 3, text: "Prescription analyzed and logged for John Doe.", time: "2 hrs ago", type: "success" },
];

export default function DashboardHome() {
    const router = useRouter();
    const [doctorId, setDoctorId] = useState<string | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setDoctorId(session.user.id);
            }
        };
        getUser();
    }, [supabase]);

    const { patients, isLoading, formatLastVisit, refetch } = usePatients(doctorId);

    const activeCases = patients.filter(p => p.status !== 'Discharged').length;
    const criticalAlerts = patients.filter(p => p.triageLevel === 'High').length;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative pb-10">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinical Overview</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back. Here is what is happening across your clinic today.</p>
            </div>

            {/* 1. KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Patients"
                    value={isLoading ? "..." : patients.length.toString()}
                    trend="Registered to clinic"
                    icon={Users}
                />
                <KPICard
                    title="Active Cases"
                    value={isLoading ? "..." : activeCases.toString()}
                    trend="Currently monitored"
                    icon={Activity}
                />
                <KPICard
                    title="AI Diagnoses Today"
                    value="18"
                    trend="85% confidence avg"
                    icon={Stethoscope}
                />
                <KPICard
                    title="Critical Alerts"
                    value={isLoading ? "..." : criticalAlerts.toString()}
                    trend="Requires immediate review"
                    icon={AlertCircle}
                    alert={criticalAlerts > 0}
                />
            </div>

            {/* 2. CHARTS & ACTIVITY FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F22] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Patient Intake & Diagnostics</h2>
                    <div className="h-64 w-full p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#121315]">
                        <PatientIntakeChart />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-[#1E1F22] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">A.M.E.L.I.A. Activity</h2>
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {ACTIVITY_FEED.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.type === 'alert' ? 'bg-red-500' :
                                    item.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.text}</p>
                                    <span className="text-xs text-gray-500">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 text-sm text-[#FC94AF] font-medium hover:underline flex items-center justify-center">
                        View Full Log <ArrowUpRight size={16} className="ml-1" />
                    </button>
                </div>
            </div>

            {/* 3. RECENT PATIENTS TABLE */}
            <div className="bg-white dark:bg-[#1E1F22] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Patients</h2>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#FC94AF] hover:bg-[#E07A96] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                        <Plus size={16} className="mr-1" /> New Patient
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#121315] text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-medium">Patient Name</th>
                                <th className="px-6 py-3 font-medium">Age</th>
                                <th className="px-6 py-3 font-medium">Last Visit</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Triage Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading patients...</td>
                                </tr>
                            )}

                            {!isLoading && patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No patients registered yet. Click "New Patient" to begin.</td>
                                </tr>
                            )}

                            {/* Map Live Data - Clickable row routing to individual view */}
                            {!isLoading && patients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#FC94AF] transition-colors">
                                        {patient.firstName} {patient.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{patient.age || '--'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {formatLastVisit(patient.updatedAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${patient.triageLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                            patient.triageLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                                                'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                            }`}>
                                            {patient.triageLevel}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* The Hidden Modal */}
            <AddPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refetch}
                doctorId={doctorId || ""}
            />

        </div>
    );
}

function KPICard({ title, value, trend, icon: Icon, alert = false }: any) {
    return (
        <div className="bg-white dark:bg-[#1E1F22] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <div className={`p-2 rounded-lg ${alert ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-[#FC94AF]/10 text-[#FC94AF]'}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="mt-auto">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className={`text-xs mt-2 ${alert ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{trend}</p>
            </div>
        </div>
    );
}