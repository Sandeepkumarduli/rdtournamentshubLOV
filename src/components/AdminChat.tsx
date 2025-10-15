import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User, Shield, Crown, MessageSquare, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
interface Message {
  id: string;
  text: string;
  sender: string;
  senderType: 'user' | 'admin' | 'system';
  timestamp: string;
  isMe: boolean;
}
interface ChatUser {
  id: string;
  name: string;
  type: 'user' | 'system';
  status: 'online' | 'offline';
  lastMessage?: string;
  unreadCount: number;
}
const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchChatUsers = async () => {
    try {
      if (!user) return;

      // Get admin's organization
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('organization')
        .eq('user_id', user.id)
        .single();

      if (!adminProfile?.organization) return;

      // Get users from the same organization
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, role')
        .eq('organization', adminProfile.organization)
        .neq('user_id', user.id);

      // Get system admins
      const { data: systemAdmins } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, role')
        .eq('role', 'systemadmin');

      const formattedUsers: ChatUser[] = [
        ...(users?.map(user => ({
          id: user.user_id,
          name: user.display_name || user.email || 'Unknown',
          type: 'user' as const,
          status: 'online' as const, // Mock status for now
          lastMessage: '',
          unreadCount: 0
        })) || []),
        ...(systemAdmins?.map(admin => ({
          id: admin.user_id,
          name: admin.display_name || admin.email || 'System Admin',
          type: 'system' as const,
          status: 'online' as const,
          lastMessage: '',
          unreadCount: 0
        })) || [])
      ];

      setChatUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (display_name, email, role)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('message_type', 'direct')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender?.display_name || msg.sender?.email || 'Unknown',
        senderType: msg.sender?.role === 'admin' || msg.sender?.role === 'systemadmin' ? 'admin' as const : 'user' as const,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        isMe: msg.sender_id === user.id,
      })) || [];

      setMessages(prev => ({
        ...prev,
        [userId]: formattedMessages
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleUserSelect = async (user: ChatUser) => {
    setSelectedUser(user);
    await fetchMessages(user.id);
  };

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time chat updates
    const channel = supabase
      .channel('admin-chat-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        // Refresh messages if we're viewing a conversation
        if (selectedUser) {
          fetchMessages(selectedUser.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser]);

  const onlineUsers = chatUsers.filter(user => user.status === 'online');
  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser && user) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([{
            sender_id: user.id,
            recipient_id: selectedUser.id,
            message: newMessage,
            message_type: 'direct',
          }]);

        if (error) throw error;

        // Refresh messages for this user
        await fetchMessages(selectedUser.id);
        setNewMessage('');

        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    }
  };
  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'system':
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  const getSenderBadgeVariant = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return 'default';
      case 'system':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Chat Center</h1>
          <p className="text-lg text-muted-foreground">Communicate with users and system admin</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-success text-success">
            <Users className="h-3 w-3 mr-1" />
            {onlineUsers.length} Online
          </Badge>
          <Badge variant="outline" className="border-primary text-primary">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Users List */}
        <Card className="lg:col-span-1 px-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chat List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 mx-0">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="online" className="px-0">Online ({onlineUsers.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 p-4 pt-0">
                    {chatUsers.map(user => <div key={user.id} onClick={() => handleUserSelect(user)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSenderIcon(user.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{user.name}</span>
                                <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-success' : 'bg-muted-foreground'}`} />
                              </div>
                              {user.lastMessage && <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user.lastMessage}
                                </p>}
                            </div>
                          </div>
                          {user.unreadCount > 0 && <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {user.unreadCount}
                            </Badge>}
                        </div>
                      </div>)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="online" className="mt-0">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 p-4 pt-0">
                    {onlineUsers.map(user => <div key={user.id} onClick={() => handleUserSelect(user)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSenderIcon(user.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{user.name}</span>
                                <div className="w-2 h-2 rounded-full bg-success" />
                              </div>
                              {user.lastMessage && <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user.lastMessage}
                                </p>}
                            </div>
                          </div>
                          {user.unreadCount > 0 && <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {user.unreadCount}
                            </Badge>}
                        </div>
                      </div>)}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedUser ? <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSenderIcon(selectedUser.type)}
                  <span>{selectedUser.name}</span>
                  <Badge variant={getSenderBadgeVariant(selectedUser.type)} className="text-xs">
                    {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ml-auto ${selectedUser.status === 'online' ? 'bg-success' : 'bg-muted-foreground'}`} />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(messages[selectedUser.id] || []).map(message => <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[70%] space-y-1">
                          {!message.isMe && <div className="flex items-center gap-2 mb-1">
                              {getSenderIcon(message.senderType)}
                              <span className="text-sm font-medium">{message.sender}</span>
                            </div>}
                          <div className={`p-3 rounded-lg ${message.isMe ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
                            <p className="text-sm">{message.text}</p>
                            <span className="text-xs opacity-70 block mt-1">{message.timestamp}</span>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Message ${selectedUser.name}...`} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </> : <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a chat</h3>
                <p>Choose a user from the list to start chatting</p>
              </div>
            </CardContent>}
        </Card>
      </div>
    </div>;
};
export default AdminChat;