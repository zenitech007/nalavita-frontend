import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface PatientProfile {
  firstName: string;
  age: number;
  gender: string;
  bloodType: string;
  genotype: string;
  weightKg: number;
  heightCm?: number;
  bodyShape?: string;
  sugarLevel?: number;
  isPregnant?: boolean;
  language?: string;
  conditions: string;
  allergies: string;
  currentMeds: string[];
}

export function useAmeliaChat(userId: string | null, userProfile: PatientProfile | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const isNewSessionRef = useRef(true);

  const sendMessage = useCallback(
    async (content: string, imageData?: string) => {
      if (!content.trim() || !userId || !userProfile) return;

      try {
        setError(null);
        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_message: content,
            user_id: userId,
            session_id: sessionIdRef.current,
            profile: userProfile,
            image_data: imageData || null,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            is_new_session: isNewSessionRef.current,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error(`Backend error: ${response.status}`);

        isNewSessionRef.current = false;

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let aiContent = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          aiContent += chunk;

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: aiContent },
              ];
            }
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: aiContent,
                createdAt: new Date().toISOString(),
              },
            ];
          });
        }

        if (userId) {
          await supabase.from('chat_history').insert({
            session_id: sessionIdRef.current,
            user_id: userId,
            user_message: content,
            ai_response: aiContent,
            image_data: imageData || null,
            urgency_level: 'NON-URGENT',
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const errorMsg = (err as Error).message;
          setError(errorMsg);
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Error: ${errorMsg}`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userId, userProfile, BACKEND_URL, supabase]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error: dbError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionIdRef.current)
        .order('created_at', { ascending: true });

      if (dbError) throw dbError;

      const loadedMessages: Message[] = [];
      data?.forEach((record) => {
        loadedMessages.push({
          id: record.id,
          role: 'user',
          content: record.user_message,
          createdAt: record.created_at,
        });
        loadedMessages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: record.ai_response,
          createdAt: record.created_at,
        });
      });

      setMessages(loadedMessages);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [userId, supabase]);

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = crypto.randomUUID();
    isNewSessionRef.current = true;
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    loadMessages,
    clearChat,
  };
}
