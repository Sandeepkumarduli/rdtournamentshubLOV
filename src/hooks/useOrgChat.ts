import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  user_id: string;
}

export const useOrgChat = () => {
  const [messages, setMessages] = useState<OrgChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Get current user's organization
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      // Get user's profile to find organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user.user_id)
        .single();

      if (!profile?.organization) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Fetch messages from users in the same organization
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (display_name, email, role, organization)
        `)
        .eq('message_type', 'organization')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter messages from same organization
      const orgMessages = data?.filter(msg => 
        msg.sender?.organization === profile.organization
      ) || [];

      const formattedMessages = orgMessages.map(msg => ({
        id: msg.id,
        username: msg.sender?.display_name || msg.sender?.email || 'Unknown',
        message: msg.message,
        timestamp: new Date(msg.created_at).toLocaleString(),
        isAdmin: msg.sender?.role === 'admin',
        user_id: msg.sender_id,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching org messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          sender_id: user.user_id,
          message: message,
          message_type: 'organization',
        }]);

      if (error) throw error;

      fetchMessages();
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('org-chat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loading,
    refetch: fetchMessages,
    sendMessage,
  };
};