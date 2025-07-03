import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User, Shield, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserChat } from '@/hooks/useUserChat';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserChat = () => {
  const [newMessage, setNewMessage] = useState('');
  const { messages, loading, canChat, sendMessage } = useUserChat();
  const { toast } = useToast();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!canChat) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Chat Support</h1>
            <p className="text-lg text-muted-foreground">Get help from our admin team</p>
          </div>
        </div>
        <div className="text-center p-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chat Not Available</h3>
          <p className="text-muted-foreground">
            You need to join an organization or participate in tournaments to access chat support.
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const result = await sendMessage(newMessage);
      if (result?.success) {
        setNewMessage('');
        toast({
          title: "Message Sent",
          description: "Your message has been sent to the admin team",
        });
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to send message",
          variant: "destructive"
        });
      }
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getSenderBadgeVariant = (senderType: string) => {
    switch (senderType) {
      case 'admin':
        return 'default';
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
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with our admin team!</p>
                </div>
              ) : (
                messages.map((message) => (
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
                ))
              )}
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