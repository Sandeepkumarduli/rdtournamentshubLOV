import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemMessage {
  id: string;
  message: string;
  sender: string;
  messageType: string;
  createdAt: string;
}

export const useSystemChat = () => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey (display_name, email)
        `)
        .eq('message_type', 'broadcast')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        message: msg.message,
        sender: msg.profiles?.display_name || msg.profiles?.email || 'System Admin',
        messageType: msg.message_type || 'broadcast',
        createdAt: new Date(msg.created_at).toLocaleString(),
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching system messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, type: string = 'broadcast') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          message,
          sender_id: session.user.id,
          message_type: type,
          recipient_id: null, // null for broadcast messages
        });

      if (error) throw error;

      // Refresh messages after sending
      fetchMessages();
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-chat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};