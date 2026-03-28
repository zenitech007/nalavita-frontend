import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export function useAmeliaChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      setError(null);
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/patients/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [...prev, ...data.messages]);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('Message')
        .select('*')
        .eq('chatId', chatId)
        .order('createdAt', { ascending: true });

      if (dbError) throw dbError;
      setMessages(data || []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [chatId, supabase]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    loadMessages,
  };
}
