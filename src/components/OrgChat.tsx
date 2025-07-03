import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrgChat } from '@/hooks/useOrgChat';
import LoadingSpinner from '@/components/LoadingSpinner';

const OrgChat = () => {
  const [message, setMessage] = useState('');
  const { messages, loading, sendMessage } = useOrgChat();
  const { toast } = useToast();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const result = await sendMessage(message);
    if (result?.success) {
      setMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the group",
      });
    } else {
      toast({
        title: "Error",
        description: result?.error || "Failed to send message",
        variant: "destructive"
      });
    }
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
            Organization Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
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
                ))
              )}
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