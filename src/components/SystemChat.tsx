import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User, Shield, Crown, MessageSquare, Users, UserCheck, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface Message {
  id: number;
  text: string;
  sender: string;
  senderType: 'user' | 'admin' | 'system';
  timestamp: string;
  isMe: boolean;
}
interface ChatUser {
  id: number;
  name: string;
  type: 'user' | 'admin';
  status: 'online' | 'offline';
  lastMessage?: string;
  unreadCount: number;
  organization?: string;
}
const SystemChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [{
      id: 1,
      text: "System admin, we need approval for the new tournament format",
      sender: 'FireStorm Admin',
      senderType: 'admin',
      timestamp: new Date().toLocaleTimeString(),
      isMe: false
    }],
    2: [{
      id: 1,
      text: "Hi, I'm facing issues with payment gateway integration",
      sender: 'PlayerOne',
      senderType: 'user',
      timestamp: new Date().toLocaleTimeString(),
      isMe: false
    }]
  });
  const [newMessage, setNewMessage] = useState('');
  const {
    toast
  } = useToast();
  const chatUsers: ChatUser[] = [{
    id: 1,
    name: 'FireStorm Admin',
    type: 'admin',
    status: 'online',
    lastMessage: 'System admin, we need approval...',
    unreadCount: 1,
    organization: 'FireStorm'
  }, {
    id: 2,
    name: 'PlayerOne',
    type: 'user',
    status: 'online',
    lastMessage: 'Payment gateway issue...',
    unreadCount: 1
  }, {
    id: 3,
    name: 'Lightning ORG Admin',
    type: 'admin',
    status: 'online',
    lastMessage: 'Tournament schedule',
    unreadCount: 0,
    organization: 'Lightning'
  }, {
    id: 4,
    name: 'GamerPro',
    type: 'user',
    status: 'offline',
    lastMessage: 'Account verification',
    unreadCount: 0
  }, {
    id: 5,
    name: 'Thunder Admin',
    type: 'admin',
    status: 'online',
    lastMessage: 'Rule clarification needed',
    unreadCount: 2,
    organization: 'Thunder'
  }, {
    id: 6,
    name: 'SquadLeader',
    type: 'user',
    status: 'online',
    lastMessage: 'Team registration help',
    unreadCount: 0
  }];
  const onlineUsers = chatUsers.filter(user => user.status === 'online');
  const adminUsers = chatUsers.filter(user => user.type === 'admin');
  const regularUsers = chatUsers.filter(user => user.type === 'user');
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message: Message = {
        id: (messages[selectedUser.id]?.length || 0) + 1,
        text: newMessage,
        sender: 'System Admin',
        senderType: 'system',
        timestamp: new Date().toLocaleTimeString(),
        isMe: true
      };
      setMessages(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), message]
      }));
      setNewMessage('');

      // Simulate response
      setTimeout(() => {
        const responses = ["Thank you for the guidance, System Admin!", "Understood, I'll implement that right away.", "Perfect, that clarifies everything!", "Got it, proceeding as advised."];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const response: Message = {
          id: (messages[selectedUser.id]?.length || 0) + 2,
          text: randomResponse,
          sender: selectedUser.name,
          senderType: selectedUser.type,
          timestamp: new Date().toLocaleTimeString(),
          isMe: false
        };
        setMessages(prev => ({
          ...prev,
          [selectedUser.id]: [...(prev[selectedUser.id] || []), response]
        }));
      }, 1000 + Math.random() * 2000);
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
  const renderUserList = (users: ChatUser[]) => <div className="space-y-2">
      {users.map(user => <div key={user.id} onClick={() => setSelectedUser(user)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSenderIcon(user.type)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-success' : 'bg-muted-foreground'}`} />
                </div>
                {user.organization && <p className="text-xs text-gaming-gold">{user.organization} ORG</p>}
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
    </div>;
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">System Chat Center</h1>
          <p className="text-lg text-muted-foreground">Master communication hub for all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-success text-success">
            <Users className="h-3 w-3 mr-1" />
            {onlineUsers.length} Online
          </Badge>
          <Badge variant="outline" className="border-gaming-gold text-gaming-gold">
            <Shield className="h-3 w-3 mr-1" />
            {adminUsers.length} ORG Admins
          </Badge>
          <Badge variant="outline" className="border-primary text-primary">
            <Crown className="h-3 w-3 mr-1" />
            System Control
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Users List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Platform Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 text-xs mx-0">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="admins">ORG</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[450px] p-4 pt-0">
                  {renderUserList(chatUsers)}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="admins" className="mt-0">
                <ScrollArea className="h-[450px] p-4 pt-0">
                  {renderUserList(adminUsers)}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <ScrollArea className="h-[450px] p-4 pt-0">
                  {renderUserList(regularUsers)}
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
                  {selectedUser.organization && <Badge variant="outline" className="text-xs border-gaming-gold text-gaming-gold">
                      {selectedUser.organization}
                    </Badge>}
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
                              <Badge variant={getSenderBadgeVariant(message.senderType)} className="text-xs">
                                {message.senderType.charAt(0).toUpperCase() + message.senderType.slice(1)}
                              </Badge>
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
                <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">System Communication</h3>
                <p>Select a user or ORG admin to start chatting</p>
              </div>
            </CardContent>}
        </Card>
      </div>
    </div>;
};
export default SystemChat;