'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    MessageSquare,
    BarChart2,
    Settings,
    Bell,
    Search,
    Menu,
    Activity
} from 'lucide-react';

import { ResponsiveContainer } from 'recharts';
import NurseAvatar from '@/components/NurseAvatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', href: '/dashboard/patients/', icon: Users },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen min-h-screen bg-gray-50 dark:bg-[#121315] text-gray-900 dark:text-gray-100 font-sans">

            {/* SIDEBAR (Desktop) */}
            <aside className={`hidden md:flex flex-col w-64 h-fullborder-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1F22] transition-colors duration-300`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <Activity className="text-[#FC94AF] mr-2" size={24} />
                    <span className="text-xl font-bold tracking-wide">A.M.E.L.I.A.</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-[#FC94AF]/10 text-[#FC94AF] font-medium'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                <Icon size={20} className="mr-3" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Doctor Profile Snippet at Bottom */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <NurseAvatar size={36} />
                        <div>
                            <p className="text-sm font-medium">Dr. Zenith</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chief Medical Officer</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* TOPBAR */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E1F22] transition-colors duration-300">
                    <div className="flex items-center flex-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Search Bar */}
                        <div className="max-w-md w-full hidden sm:block relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search patients, conditions, or files..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#121315] text-sm focus:outline-none focus:ring-2 focus:ring-[#FC94AF]/50 dark:text-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 dark:bg-[#121315] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}