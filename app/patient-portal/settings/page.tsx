'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Palette, Globe, Bell, Save, Moon, Sun,
    ShieldCheck, Activity, Smartphone, Check
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

// Mock Theme Colors
const THEMES = [
    { name: 'Amelia Pink', value: '#FC94AF' },
    { name: 'Royal Purple', value: '#A855F7' },
    { name: 'Ocean Blue', value: '#3B82F6' },
    { name: 'Emerald Green', value: '#10B981' },
];

export default function PatientSettings() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'language' | 'notifications'>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Appearance State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTheme, setActiveTheme] = useState(THEMES[0].value);

    // Profile & Language State
    const [formData, setFormData] = useState({
        firstName: 'Jane', lastName: 'Doe', phone: '+1 (555) 123-4567',
        height: '165', weight: '65', bloodType: 'O+', allergies: 'Penicillin',
        language: 'English',
        emailNotifs: true, smsNotifs: true, whatsappNotifs: false
    });

    // Detect initial dark mode & load saved preference
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('amelia-theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            // Use saved theme if it exists, otherwise fall back to system preference
            const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

            setIsDarkMode(isDark);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // Explicitly force Light or Dark mode
    const setDisplayTheme = (forceDark: boolean) => {
        setIsDarkMode(forceDark);
        if (forceDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('amelia-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('amelia-theme', 'light');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call to save preferences to Supabase
        setTimeout(() => {
            setIsLoading(false);
            // Optionally show a success toast here
        }, 1500);
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

    const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none transition-all";
    const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider";

    const tabs = [
        { id: 'profile', label: 'Personal Profile', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'language', label: 'AI Language', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ] as const;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="text-[#FC94AF]" style={{ color: activeTheme }} /> Settings & Preferences
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account details, AI settings, and app appearance.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* --- SIDEBAR TABS (Horizontal on Mobile) --- */}
                <motion.div variants={itemVariants} className="md:w-64 shrink-0">
                    <div className="flex md:flex-col overflow-x-auto custom-scrollbar gap-2 pb-2 md:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} style={{ color: activeTab === tab.id ? activeTheme : undefined }} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* --- SETTINGS CONTENT AREA --- */}
                <motion.div variants={itemVariants} className="flex-1">
                    <div className="bg-white dark:bg-[#1E1F22] rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 min-h-125 relative overflow-hidden">

                        {/* Decorative Background Flare */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: activeTheme }}></div>

                        <AnimatePresence mode="wait">

                            {/* 1. PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <motion.form key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSave} className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold mb-4">Personal Information</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div><label className={labelClass}>First Name</label><input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} style={{ '--tw-ring-color': activeTheme } as any} /></div>
                                            <div><label className={labelClass}>Last Name</label><input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} /></div>
                                            <div className="sm:col-span-2"><label className={labelClass}>Phone Number</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} /></div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={18} style={{ color: activeTheme }} /> Basic Medical Profile</h2>
                                        <p className="text-xs text-gray-500 mb-4">This information helps Amelia AI provide accurate triage advice.</p>
                                        <div className="grid grid-cols-2 gap-5 mb-5">
                                            <div><label className={labelClass}>Height (cm)</label><input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className={inputClass} /></div>
                                            <div><label className={labelClass}>Weight (kg)</label><input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className={inputClass} /></div>
                                            <div className="col-span-2"><label className={labelClass}>Blood Type</label><select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className={inputClass}><option>A+</option><option>O+</option><option>O-</option><option>AB+</option></select></div>
                                        </div>
                                    </div>
                                </motion.form>
                            )}

                            {/* 2. APPEARANCE TAB */}
                            {activeTab === 'appearance' && (
                                <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

                                    {/* Dark Mode Toggle */}
                                    <div>
                                        <h2 className="text-lg font-bold mb-4">Display Theme</h2>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setDisplayTheme(false)}
                                                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${!isDarkMode ? 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-gray-600' : 'bg-transparent border-gray-100 dark:border-white/5 hover:border-gray-200'}`}
                                                style={{ borderColor: !isDarkMode ? activeTheme : undefined }}
                                            >
                                                <Sun size={32} className={!isDarkMode ? 'text-gray-900 dark:text-white' : 'text-gray-400'} style={{ color: !isDarkMode ? activeTheme : undefined }} />
                                                <span className={`text-sm font-bold ${!isDarkMode ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Light Mode</span>
                                            </button>
                                            <button
                                                onClick={() => setDisplayTheme(true)}
                                                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${isDarkMode ? 'bg-gray-50 dark:bg-[#121315] border-gray-300 dark:border-gray-600' : 'bg-transparent border-gray-100 dark:border-white/5 hover:border-gray-200'}`}
                                                style={{ borderColor: isDarkMode ? activeTheme : undefined }}
                                            >
                                                <Moon size={32} className={isDarkMode ? 'text-gray-900 dark:text-white' : 'text-gray-400'} style={{ color: isDarkMode ? activeTheme : undefined }} />
                                                <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Dark Mode</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Accent Color Picker */}
                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                        <h2 className="text-lg font-bold mb-1">Accent Color</h2>
                                        <p className="text-xs text-gray-500 mb-4">Personalize the color of buttons and highlights.</p>
                                        <div className="flex flex-wrap gap-4">
                                            {THEMES.map((theme) => (
                                                <button
                                                    key={theme.name}
                                                    onClick={() => setActiveTheme(theme.value)}
                                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTheme === theme.value ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
                                                    style={{ backgroundColor: theme.value, boxShadow: activeTheme === theme.value ? `0 0 20px ${theme.value}60` : 'none' }}
                                                    title={theme.name}
                                                >
                                                    {activeTheme === theme.value && <Check size={20} className="text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3. AI LANGUAGE TAB */}
                            {activeTab === 'language' && (
                                <motion.form key="language" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSave} className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6">
                                        <Globe className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Amelia Localized Support</h4>
                                            <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">Select your preferred language. Amelia AI will automatically translate health advice, triage questions, and medication instructions into this language.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>AI Communication Language</label>
                                        <select
                                            value={formData.language}
                                            onChange={e => setFormData({ ...formData, language: e.target.value })}
                                            className={`${inputClass} border-2`}
                                            style={{ borderColor: activeTheme }}
                                        >
                                            <option value="English">English (Default)</option>
                                            <option value="Yoruba">Yoruba</option>
                                            <option value="Hausa">Hausa</option>
                                            <option value="Igbo">Igbo</option>
                                            <option value="Nigerian Pidgin">Nigerian Pidgin</option>
                                        </select>
                                    </div>
                                </motion.form>
                            )}

                            {/* 4. NOTIFICATIONS TAB */}
                            {activeTab === 'notifications' && (
                                <motion.form key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSave} className="space-y-6">
                                    <h2 className="text-lg font-bold mb-4">Alert Preferences</h2>

                                    <div className="space-y-4">
                                        {/* Custom Toggle Switches */}
                                        {[
                                            { id: 'emailNotifs', label: 'Email Notifications', desc: 'Receive appointment reminders and lab results.' },
                                            { id: 'smsNotifs', label: 'SMS Alerts', desc: 'Critical medication reminders via text message.' },
                                            { id: 'whatsappNotifs', label: 'WhatsApp Assistant', desc: 'Allow Amelia AI to message you on WhatsApp.' }
                                        ].map((toggle) => (
                                            <div key={toggle.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#121315] rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <div>
                                                    <h4 className="font-bold text-sm">{toggle.label}</h4>
                                                    <p className="text-xs text-gray-500">{toggle.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, [toggle.id]: !(formData as any)[toggle.id] })}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${(formData as any)[toggle.id] ? 'bg-[#FC94AF]' : 'bg-gray-300 dark:bg-gray-700'
                                                        }`}
                                                    style={{ backgroundColor: (formData as any)[toggle.id] ? activeTheme : undefined }}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${(formData as any)[toggle.id] ? 'translate-x-6' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.form>
                            )}

                        </AnimatePresence>

                        {/* Universal Save Button */}
                        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                                style={{ backgroundColor: activeTheme, boxShadow: `0 10px 15px -3px ${activeTheme}40` }}
                            >
                                {isLoading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}