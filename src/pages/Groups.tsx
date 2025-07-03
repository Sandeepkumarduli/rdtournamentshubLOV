import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, MessageSquare, Trophy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: number;
  orgName: string;
  adminName: string;
  memberCount: number;
  activeTournaments: number;
  totalPrizePool: string;
  joinedDate: string;
}

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock groups data
  const mockGroups: Group[] = [
    {
      id: 1,
      orgName: "FireStorm ORG",
      adminName: "AdminStorm",
      memberCount: 156,
      activeTournaments: 3,
      totalPrizePool: "₹2,45,000",
      joinedDate: "2024-01-15"
    },
    {
      id: 2,
      orgName: "Thunder Eagles",
      adminName: "EagleAdmin",
      memberCount: 89,
      activeTournaments: 2,
      totalPrizePool: "₹1,50,000",
      joinedDate: "2024-01-10"
    }
  ];

  // Mock messages for selected group
  const mockMessages: Message[] = [
    {
      id: 1,
      username: "AdminStorm",
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
  ];

  const filteredGroups = mockGroups.filter(group =>
    group.orgName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!message.trim() || !selectedGroup) return;

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedGroup.orgName}`,
    });
    
    setMessage('');
  };

  const handleJoinGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Groups</h1>
          <p className="text-lg text-muted-foreground">Connect with tournament organizations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Groups List */}
        <div className="lg:col-span-1">
          <Card className="gaming-card h-full">
            <CardHeader>
              <CardTitle>My Groups</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-6 pt-0 space-y-3">
                  {filteredGroups.map((group) => (
                    <Card 
                      key={group.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id ? 'bg-primary/20 border-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleJoinGroup(group)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{group.orgName}</h3>
                            <Badge variant="outline">{group.memberCount} members</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Admin: {group.adminName}</div>
                            <div>Active Tournaments: {group.activeTournaments}</div>
                            <div className="text-gaming-gold">Total Prize: {group.totalPrizePool}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <Card className="gaming-card h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {selectedGroup.orgName} Chat
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{selectedGroup.memberCount} members</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {mockMessages.map((msg) => (
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
          ) : (
            <Card className="gaming-card h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Group</h3>
                <p className="text-muted-foreground">Choose a group from the list to start chatting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;