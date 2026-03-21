'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, HeartPulse, Pill, Calendar,
    MessageCircle, FileText, Settings, Activity, 
    Menu, LogOut, X, Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface PatientSidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function PatientSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: PatientSidebarProps) {
    const pathname = usePathname();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const mainNavLinks = [
        { name: 'Overview', href: '/patient-portal', icon: LayoutDashboard },
        { name: 'Amelia AI Chat', href: '/patient-portal/chat', icon: MessageCircle },
        { name: 'My Health Record', href: '/patient-portal/records', icon: HeartPulse },
        { name: 'Medications', href: '/patient-portal/medications', icon: Pill },
        { name: 'Appointments', href: '/patient-portal/appointments', icon: Calendar },
        { name: 'Lab Results', href: '/patient-portal/labs', icon: FileText },
    ];

    return (
        <>
            {/* --- DESKTOP SIDEBAR (Flush & Gemini-Style) --- */}
            <aside className={`hidden lg:flex flex-col h-screen bg-[#f9f9f9] dark:bg-[#1E1F22] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0 ${isCollapsed ? 'w-[72px]' : 'w-72'}`}>
                
                {/* Top: Hamburger Menu Button */}
                <div className="h-16 flex items-center px-4 shrink-0">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="p-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="Expand/Collapse Menu"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Main Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                    {mainNavLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.name} href={link.href} className="block relative group" title={isCollapsed ? link.name : undefined}>
                                <div className={`relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#FC94AF]/10 text-[#FC94AF] font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 font-medium'} ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                    <link.icon size={20} className={`shrink-0 ${isActive ? 'text-[#FC94AF]' : 'opacity-70 group-hover:opacity-100'}`} />
                                    
                                    {!isCollapsed && <span className="whitespace-nowrap truncate">{link.name}</span>}
                                    
                                    {!isCollapsed && link.name === 'Amelia AI Chat' && (
                                        <Sparkles size={14} className="ml-auto text-[#FC94AF] animate-pulse shrink-0" />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Controls (Settings & Logout) */}
                <div className="p-3 space-y-1 shrink-0">
                    <Link href="/patient-portal/settings" className="block relative group" title={isCollapsed ? "Settings" : undefined}>
                        <div className={`relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${pathname === '/patient-portal/settings' ? 'bg-[#FC94AF]/10 text-[#FC94AF] font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 font-medium'} ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <Settings size={20} className={`shrink-0 ${pathname === '/patient-portal/settings' ? 'text-[#FC94AF]' : 'opacity-70 group-hover:opacity-100'}`} />
                            {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
                        </div>
                    </Link>
                    
                    <button onClick={handleLogout} className={`flex items-center w-full px-3 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium ${isCollapsed ? 'justify-center' : 'gap-3'}`} title="Sign Out">
                        <LogOut size={20} className="shrink-0 opacity-70" /> 
                        {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* --- MOBILE OVERLAY SIDEBAR --- */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 bg-[#f9f9f9] dark:bg-[#1E1F22] shadow-2xl z-50 flex flex-col lg:hidden border-r border-gray-200 dark:border-gray-800">
                            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 px-2">
                                    <Activity className="text-[#FC94AF]" size={20} />
                                    <span className="font-bold text-lg dark:text-white tracking-tight">Nala Vita</span>
                                </div>
                                <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-500"><X size={18} /></button>
                            </div>
                            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                                {[...mainNavLinks, { name: 'Settings', href: '/patient-portal/settings', icon: Settings }].map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-[#FC94AF]/10 text-[#FC94AF] font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 font-medium'}`}>
                                            <link.icon size={18} className={isActive ? 'text-[#FC94AF]' : 'opacity-70'} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><LogOut size={18} /> Sign Out</button></div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}