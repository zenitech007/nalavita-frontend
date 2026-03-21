'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Menu, Activity, Pill, Bell, X } from 'lucide-react';

import { THEMES } from '@/lib/themes';
import { createClient } from '@/lib/supabaseClient';
import { useAmeliaChat } from '@/hooks/useAmeliaChat'; // <-- NEW HOOK IMPORT

import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import SettingsModal from '@/components/SettingsModal';
import TypingIndicator from '@/components/TypingIndicator';
import NurseAvatar from '@/components/NurseAvatar';
import HealthDashboard from '@/components/HealthDashboard';
import MedicationSchedule from '@/components/MedicationSchedule';
import AmeliaAlert, { AlertData } from '@/components/AmeliaAlert';

// --- HELPER: VAPID Key Converter ---
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  // --- CORE UI STATE ---
  const [user, setUser] = useState<any>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [isOffline, setIsOffline] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES.rose);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isMedsOpen, setIsMedsOpen] = useState(false);

  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const triggerAlert = useCallback((message: string, type: 'success' | 'warning' | 'info' | 'reminder') => {
    setAlertData({ id: Date.now().toString(), type, message });
  }, []);

  // --- ATTACH THE CUSTOM HOOK ---
  const {
    messages, inputText, imageFile, isLoading, isSending,
    chats, currentChatId, activeMeds,
    setInputText, setImageFile,
    sendMessage, handleNewChat, handleSelectChat,
    handleRenameChat, handleTogglePin, handleDeleteChat
  } = useAmeliaChat({ user, patientProfile, triggerAlert });

  // --- SCROLL TO BOTTOM ON NEW MESSAGE ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- OFFLINE MODE LISTENER ---
  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // --- THEME INITIALIZATION ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- AUTHENTICATION CHECK ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/profile?userId=${session.user.id}`, { cache: 'no-store' });
      const profile = await res.json();

      if (!profile || !profile.id) {
        router.push('/onboarding');
      } else {
        setUser(session.user);
        setPatientProfile(profile);
        setIsAuthChecking(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // --- PUSH NOTIFICATION SYSTEM ---
  const enableNotifications = async () => {
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        triggerAlert("Notification keys are not configured on the server.", "warning");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error("Permission denied by user");

      const registration = await navigator.serviceWorker.getRegistration() || await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify(subscription)
      });

      if (res.ok) triggerAlert("Notifications synced with Amelia!", "success");
    } catch (err) {
      console.error("Sync failed:", err);
      triggerAlert("Could not sync notifications. Please check browser permissions.", "warning");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#1E1F22] transition-colors duration-300">
        <div className="animate-pulse text-[#FC94AF] font-semibold text-lg flex items-center gap-2">
          <NurseAvatar size={40} /> Verifying Identity...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#1E1F22] font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">

      <AmeliaAlert alert={alertData} onClose={() => setAlertData(null)} activeTheme={activeTheme} />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTheme={activeTheme}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onTogglePin={handleTogglePin}
        onRenameChat={handleRenameChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#1E1F22] transition-colors duration-300">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSidebarOpen(true);
                // On mobile, clicking menu should reset chat selection
                if (window.innerWidth < 768) handleNewChat();
              }}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${isSidebarOpen ? 'hidden md:hidden' : 'block'}`}
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="font-semibold text-lg tracking-wide text-gray-800 dark:text-gray-200">Amelia</span>
            {isOffline && (
              <div className="text-xs text-red-400 ml-3">Offline mode</div>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1">
            <button onClick={enableNotifications} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Enable Push Alerts">
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => setIsMedsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative" title="Medication Schedule">
              <Pill size={20} className="text-gray-600 dark:text-gray-400" />
              {activeMeds.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>}
            </button>
            <button onClick={() => setIsDashboardOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Daily Vitals">
              <Activity size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Settings">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8 pb-32">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full mt-32 text-center opacity-80 animate-in fade-in duration-700">
                <div className="mb-6 shadow-md rounded-full border-4 border-white dark:border-[#1E1F22] transition-colors duration-300">
                  <NurseAvatar size={80} />
                </div>
                <h2 className="text-2xl font-semibold mb-2 dark:text-white">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  I am equipped to provide medical information, analyze symptoms, and guide your daily wellness routines.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatMessage key={index} msg={msg} activeTheme={activeTheme} />
            ))}

            {isLoading && <TypingIndicator activeTheme={activeTheme} />}
            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          isLoading={isLoading || isSending}
          activeTheme={activeTheme}
          imageFile={imageFile}
          setImageFile={setImageFile}
        />
      </div>

      {isSettingsOpen && (
        <SettingsModal
          setIsSettingsOpen={setIsSettingsOpen}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          patientProfile={patientProfile}
          setPatientProfile={setPatientProfile}
          user={user}
        />
      )}

      <HealthDashboard
        isOpen={isDashboardOpen}
        setIsOpen={setIsDashboardOpen}
        user={user}
        activeTheme={activeTheme}
        triggerAlert={triggerAlert}
      />

      {isMedsOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md m-4 relative">
            <button onClick={() => setIsMedsOpen(false)} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-[#FC94AF] transition-colors">
              <X size={24} />
            </button>
            <MedicationSchedule medications={activeMeds} />
          </div>
        </div>
      )}

    </div>
  );
}