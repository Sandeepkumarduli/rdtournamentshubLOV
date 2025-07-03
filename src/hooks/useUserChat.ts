import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserChatMessage {
  id: string;
  text: string;
  sender: string;
  senderType: 'user' | 'admin';
  timestamp: string;
  isMe: boolean;
}

export const useUserChat = () => {
  const [messages, setMessages] = useState<UserChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [canChat, setCanChat] = useState(false);

  const checkChatAccess = async () => {
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        setCanChat(false);
        return;
      }

      // Check if user is in an organization or has tournament registrations
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user.user_id)
        .single();

      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select('id')
        .eq('team_id', user.user_id)
        .limit(1);

      const hasAccess = profile?.organization || (registrations && registrations.length > 0);
      setCanChat(!!hasAccess);
    } catch (error) {
      console.error('Error checking chat access:', error);
      setCanChat(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const auth = localStorage.getItem("userAuth");
      const user = auth ? JSON.parse(auth) : null;
      
      if (!user?.user_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (display_name, email, role),
          recipient:profiles!chat_messages_recipient_id_fkey (display_name, email, role)
        `)
        .or(`sender_id.eq.${user.user_id},recipient_id.eq.${user.user_id}`)
        .eq('message_type', 'direct')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender?.display_name || msg.sender?.email || 'Unknown',
        senderType: msg.sender?.role === 'admin' ? 'admin' as const : 'user' as const,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        isMe: msg.sender_id === user.user_id,
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
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

      // Find an admin to send message to (preferably from same organization)
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user.user_id)
        .single();

      let adminQuery = supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (profile?.organization) {
        adminQuery = adminQuery.eq('organization', profile.organization);
      }

      const { data: admins } = await adminQuery.limit(1);

      if (!admins || admins.length === 0) {
        return { error: 'No admin available to chat with' };
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          sender_id: user.user_id,
          recipient_id: admins[0].user_id,
          message: message,
          message_type: 'direct',
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
    checkChatAccess();
    fetchMessages();

    const channel = supabase
      .channel('user-chat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loading,
    canChat,
    refetch: fetchMessages,
    sendMessage,
  };
};