import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemChatUser {
  id: string;
  name: string;
  type: 'user' | 'admin';
  status: 'online' | 'offline';
  lastMessage?: string;
  unreadCount: number;
  organization?: string;
}

export interface SystemChatMessage {
  id: string;
  text: string;
  sender: string;
  senderType: 'user' | 'admin' | 'system';
  timestamp: string;
  isMe: boolean;
}

export const useSystemChat = () => {
  const [users, setUsers] = useState<SystemChatUser[]>([]);
  const [messages, setMessages] = useState<Record<string, SystemChatMessage[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchChatUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['user', 'admin'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(profile => ({
        id: profile.user_id,
        name: profile.display_name || profile.email || 'Unknown',
        type: profile.role === 'admin' ? 'admin' as const : 'user' as const,
        status: 'online' as const, // In a real app, you'd track this
        lastMessage: 'Available for chat',
        unreadCount: 0,
        organization: profile.organization,
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (display_name, email, role),
          recipient:profiles!chat_messages_recipient_id_fkey (display_name, email, role)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender?.display_name || msg.sender?.email || 'Unknown',
        senderType: msg.sender?.role === 'admin' ? 'admin' as const : 
                   msg.sender?.role === 'systemadmin' ? 'system' as const : 'user' as const,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        isMe: false, // Set based on current user
      })) || [];

      setMessages(prev => ({
        ...prev,
        [userId]: formattedMessages,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (recipientId: string, message: string) => {
    try {
      // Get current system admin user ID (in a real app, this would come from auth)
      const systemAdminId = 'system-admin-id'; // This should be the actual system admin's user_id

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          sender_id: systemAdminId,
          recipient_id: recipientId,
          message: message,
          message_type: 'direct',
        }]);

      if (error) throw error;

      // Refresh messages for this user
      fetchMessages(recipientId);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  };

  useEffect(() => {
    fetchChatUsers();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-chat-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchChatUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        // Refresh messages for all users
        users.forEach(user => fetchMessages(user.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    users,
    messages,
    loading,
    refetch: fetchChatUsers,
    fetchMessages,
    sendMessage,
  };
};