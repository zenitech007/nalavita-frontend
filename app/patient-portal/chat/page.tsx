'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { THEMES } from '@/lib/themes';

// EXACT OLD COMPONENTS
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const USER = 'user';
const AMELIA = 'assistant';

interface Message {
  id?: string;
  role: string;
  content: string;
  imageUrl?: string;
}

export default function PatientAmeliaChat() {
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [user, setUser] = useState<any>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES.rose);

  // Fetch the real patient data on mount
  useEffect(() => {
    const fetchMyData = async () => {
      try {
        // 1. Get the local Supabase session token
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No active session found locally.");
        }

        setUser(session.user);

        // 2. Pass the token securely in the headers
        const res = await fetch('/api/patients/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Backend specifically said:", errorData);
          throw new Error(errorData.error || "Failed to fetch data");
        }

        const data = await res.json();
        setPatientProfile(data);
      } catch (error) {
        console.error("Fetch caught an error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 2. SECURE SEND MESSAGE LOGIC
  const sendMessage = async () => {
    if ((!inputText.trim() && !imageFile) || !user) return;

    const userText = inputText.trim() || "Uploaded an image";
    let base64Image = null;

    if (imageFile) {
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const userMessage: Message = {
      role: USER,
      content: imageFile ? `[Image Attached] ${userText}` : userText,
      imageUrl: base64Image || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setImageFile(null);
    setIsLoading(true);

    try {
      // 1. Get the local Supabase session token to authenticate with your Next.js backend
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }

      // 2. Prepare the payload for the Next.js Bridge
      // Notice we DO NOT send the user_id or profile here anymore. Next.js handles that securely!
      const payload = {
        user_message: userText,
        image_data: base64Image,
        history: messages.slice(-10),
        is_new_session: messages.length === 0
      };

      // 3. Call your Next.js Bridge API 
      // (Make sure your route.ts from earlier is saved at app/api/chat/route.ts)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Securely pass the token
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Safely catch errors without crashing the JSON parser
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      // 4. Stream the response directly from the Next.js bridge
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let ameliaRawText = "";

      if (reader) {
        setMessages(prev => [...prev, { role: AMELIA, content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          ameliaRawText += chunk;

          // Strip tags for UI
          const displayContent = ameliaRawText.replace(/\[AMELIA_NEW_MED:.*?\]/g, '').trim();

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: AMELIA, content: displayContent };
            return updated;
          });
        }
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'system', content: `⚠️ Error connecting to Amelia: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#131314] relative">

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 w-full scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full mt-32 text-center opacity-80 animate-in fade-in duration-700">
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">
                How can I help you today, {patientProfile?.firstName || 'there'}?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                I am Amelia, your personal AI medical assistant. I can analyze symptoms, review documents, and check your vitals.
              </p>
            </div>
          )}

          {/* RENDERING YOUR EXACT OLD COMPONENTS */}
          {messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg as any} activeTheme={activeTheme} />
          ))}

          {isLoading && <TypingIndicator activeTheme={activeTheme} />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* RENDERING YOUR EXACT OLD INPUT BOX */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white via-white to-transparent dark:from-[#131314] dark:via-[#131314] pt-10 shrink-0 z-10">
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          isLoading={isLoading}
          activeTheme={activeTheme}
          imageFile={imageFile}
          setImageFile={setImageFile}
        />
      </div>
    </div>
  );
}