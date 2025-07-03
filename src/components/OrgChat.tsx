import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

const OrgChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      username: "Admin",
      message: "Welcome to FireStorm ORG! Tournament starts in 30 minutes.",
      timestamp: "2024-01-20 17:30",
      isAdmin: true
    },
    {
      id: 2,
      username: "PlayerOne",
      message: "Ready for the tournament! Team is prepared.",
      timestamp: "2024-01-20 17:35",
      isAdmin: false
    },
    {
      id: 3,
      username: "GamerPro",
      message: "Good luck everyone! Let's dominate!",
      timestamp: "2024-01-20 17:40",
      isAdmin: false
    }
  ]);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      username: "Admin", // This would be dynamic based on logged in user
      message: message.trim(),
      timestamp: new Date().toLocaleString(),
      isAdmin: true // This would be based on user role
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the group",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ORG Chat</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">24 members online</span>
        </div>
      </div>

      <Card className="gaming-card h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            FireStorm ORG Group Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={msg.isAdmin ? "bg-primary text-primary-foreground" : "bg-accent"}>
                      {msg.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${msg.isAdmin ? "text-primary" : "text-foreground"}`}>
                        {msg.username}
                        {msg.isAdmin && <span className="text-xs text-gaming-gold ml-1">(Admin)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgChat;