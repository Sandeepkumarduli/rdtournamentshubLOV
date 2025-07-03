import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User, Shield, Crown, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: string;
  senderType: 'user' | 'admin' | 'system';
  timestamp: string;
  isMe: boolean;
}

const UserChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to RDTH Chat! How can we help you today?",
      sender: 'System Admin',
      senderType: 'system',
      timestamp: new Date().toLocaleTimeString(),
      isMe: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'You',
        senderType: 'user',
        timestamp: new Date().toLocaleTimeString(),
        isMe: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate response from admin/system
      setTimeout(() => {
        const responses = [
          "Thanks for your message! We'll get back to you soon.",
          "Your query has been received. An admin will respond shortly.",
          "We're looking into your request. Please wait a moment.",
          "Thank you for contacting support. How else can we help?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const response: Message = {
          id: messages.length + 2,
          text: randomResponse,
          sender: Math.random() > 0.5 ? 'ORG Admin' : 'System Admin',
          senderType: Math.random() > 0.5 ? 'admin' : 'system',
          timestamp: new Date().toLocaleTimeString(),
          isMe: false
        };
        setMessages(prev => [...prev, response]);
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
          <h1 className="text-4xl font-bold">Chat Support</h1>
          <p className="text-lg text-muted-foreground">Get help from our admin team</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary">
          <MessageSquare className="h-3 w-3 mr-1" />
          Live Chat
        </Badge>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[70%] space-y-1">
                    {!message.isMe && (
                      <div className="flex items-center gap-2 mb-1">
                        {getSenderIcon(message.senderType)}
                        <span className="text-sm font-medium">{message.sender}</span>
                        <Badge variant={getSenderBadgeVariant(message.senderType)} className="text-xs">
                          {message.senderType.charAt(0).toUpperCase() + message.senderType.slice(1)}
                        </Badge>
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
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserChat;