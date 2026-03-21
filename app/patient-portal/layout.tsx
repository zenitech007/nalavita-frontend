'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Menu, UserCircle, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import PatientSidebar from '@/components/PatientSidebar';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [userName, setUserName] = useState<string>('Patient');

    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fallback to email prefix
                setUserName(session.user.email?.split('@')[0] || 'Patient');
                
                // Fetch REAL name from the new database schema
                try {
                    const res = await fetch('/api/patients/me', {
                        headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.firstName) setUserName(data.firstName);
                    }
                } catch (error) {
                    console.error("Failed to load profile name", error);
                }
            }
        };
        fetchUser();
    }, [supabase]);

    return (
        <div className="flex h-screen min-h-screen bg-white dark:bg-[#131314] text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
            <PatientSidebar 
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 h-screen">
                <header className="h-16 bg-white dark:bg-[#131314] border-b border-gray-100 dark:border-gray-800/50 px-4 sm:px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full lg:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Activity className="text-[#FC94AF]" size={22} />
                            <h2 className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-200">
                                Nala Vita
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FC94AF] border border-white dark:border-[#131314] rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#FC94AF]">
                                <UserCircle size={24} />
                            </div>
                            <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-300">
                                {userName}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full max-w-7xl mx-auto">
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}