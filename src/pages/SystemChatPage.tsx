import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Search,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import { useSystemChat } from "@/hooks/useSystemChat";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemChatPage = () => {
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { messages, loading, sendMessage, refetch } = useSystemChat();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const result = await sendMessage(message, 'broadcast');
    if (result.success) {
      setMessage("");
      toast({
        title: "Message Sent",
        description: "Broadcast message sent to all users",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Chat Refreshed", 
      description: "Latest messages loaded",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">System Chat Center</h1>
                <p className="text-muted-foreground">Communicate with all platform users</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-primary text-primary">
                  <Users className="h-3 w-3 mr-1" />
                  All Users
                </Badge>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col">
          {/* Search */}
          <div className="relative w-96 mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Messages Area */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                System Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Display */}
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Send your first broadcast message!</p>
                  </div>
                ) : (
                  messages
                    .filter(msg => 
                      !searchTerm || 
                      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{msg.sender}</span>
                            <Badge variant="outline" className="text-xs">
                              {msg.messageType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{msg.createdAt}</span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your broadcast message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                    Send Broadcast
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This message will be sent to all platform users
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SystemChatPage;