import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User, Shield, Crown, MessageSquare, Users, UserCheck } from 'lucide-react';
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
  type: 'user' | 'system';
  status: 'online' | 'offline';
  lastMessage?: string;
  unreadCount: number;
}

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 1,
        text: "Hi admin, I need help with tournament registration",
        sender: 'PlayerOne',
        senderType: 'user',
        timestamp: new Date().toLocaleTimeString(),
        isMe: false
      }
    ],
    3: [
      {
        id: 1,
        text: "Please review the new tournament policies",
        sender: 'System Admin',
        senderType: 'system',
        timestamp: new Date().toLocaleTimeString(),
        isMe: false
      }
    ]
  });
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const chatUsers: ChatUser[] = [
    { id: 1, name: 'PlayerOne', type: 'user', status: 'online', lastMessage: 'Hi admin, I need help...', unreadCount: 1 },
    { id: 2, name: 'GamerPro', type: 'user', status: 'online', lastMessage: 'Tournament issue', unreadCount: 0 },
    { id: 3, name: 'System Admin', type: 'system', status: 'online', lastMessage: 'Please review the new...', unreadCount: 1 },
    { id: 4, name: 'SquadLeader', type: 'user', status: 'offline', lastMessage: 'Payment problem', unreadCount: 0 },
    { id: 5, name: 'ProPlayer', type: 'user', status: 'online', lastMessage: 'Match results', unreadCount: 2 }
  ];

  const onlineUsers = chatUsers.filter(user => user.status === 'online');

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message: Message = {
        id: (messages[selectedUser.id]?.length || 0) + 1,
        text: newMessage,
        sender: 'ORG Admin',
        senderType: 'admin',
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
        const responses = [
          "Thank you for the quick response!",
          "Got it, I'll follow up on that.",
          "That helps a lot, thanks!",
          "Perfect, issue resolved!"
        ];
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

  return (
    <div className="space-y-6">
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chat List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="online">Online ({onlineUsers.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 p-4 pt-0">
                    {chatUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSenderIcon(user.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{user.name}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                  user.status === 'online' ? 'bg-success' : 'bg-muted-foreground'
                                }`} />
                              </div>
                              {user.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          {user.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {user.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="online" className="mt-0">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 p-4 pt-0">
                    {onlineUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSenderIcon(user.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{user.name}</span>
                                <div className="w-2 h-2 rounded-full bg-success" />
                              </div>
                              {user.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {user.lastMessage}
                                </p>
                              )}
                            </div>
                          </div>
                          {user.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {user.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSenderIcon(selectedUser.type)}
                  <span>{selectedUser.name}</span>
                  <Badge variant={getSenderBadgeVariant(selectedUser.type)} className="text-xs">
                    {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ml-auto ${
                    selectedUser.status === 'online' ? 'bg-success' : 'bg-muted-foreground'
                  }`} />
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(messages[selectedUser.id] || []).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[70%] space-y-1">
                          {!message.isMe && (
                            <div className="flex items-center gap-2 mb-1">
                              {getSenderIcon(message.senderType)}
                              <span className="text-sm font-medium">{message.sender}</span>
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.isMe
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <span className="text-xs opacity-70 block mt-1">{message.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedUser.name}...`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a chat</h3>
                <p>Choose a user from the list to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminChat;