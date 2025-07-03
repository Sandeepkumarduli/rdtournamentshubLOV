import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User } from 'lucide-react';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientType: 'user' | 'admin' | 'system';
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

const ChatDialog = ({ isOpen, onClose, recipientName, recipientType }: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: 'other',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate response
      setTimeout(() => {
        const response: Message = {
          id: messages.length + 2,
          text: "Thanks for your message. I'll get back to you soon!",
          sender: 'other',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chat with {recipientName}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4 border rounded-lg">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;