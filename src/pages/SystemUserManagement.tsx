import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Eye, 
  UserPlus, 
  Trash2,
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemUserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (!auth) {
      navigate("/systemadminlogin");
      return;
    }
    
    const user = JSON.parse(auth);
    if (user.role !== "systemadmin") {
      navigate("/systemadminlogin");
      return;
    }
    
    setLoading(false);
  }, [navigate]);

  const handleDeleteUser = (userId: number) => {
    toast({
      title: "User Deleted",
      description: "User has been permanently removed from the platform",
      variant: "destructive"
    });
  };

  const handleAddUser = () => {
    toast({
      title: "Add User",
      description: "User addition feature would be implemented here",
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const mockUsers = [
    { 
      id: 1, 
      username: "PlayerOne", 
      email: "player1@example.com", 
      bgmiId: "BGMI123456", 
      phone: "+91 9876543210", 
      createdAt: "2024-01-15",
      status: "Active"
    },
    { 
      id: 2, 
      username: "GamerPro", 
      email: "gamer@example.com", 
      bgmiId: "BGMI789012", 
      phone: "+91 9876543211", 
      createdAt: "2024-01-20",
      status: "Active"
    },
    { 
      id: 3, 
      username: "SquadLeader", 
      email: "squad@example.com", 
      bgmiId: "BGMI345678", 
      phone: "+91 9876543212", 
      createdAt: "2024-01-10",
      status: "Inactive"
    },
    { 
      id: 4, 
      username: "NightOwl", 
      email: "night@example.com", 
      bgmiId: "BGMI901234", 
      phone: "+91 9876543213", 
      createdAt: "2024-01-25",
      status: "Active"
    },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bgmiId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage all platform users</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleAddUser}>
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Search and Stats */}
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username, email, BGMI ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Users:</span>
                  <span className="font-bold">{mockUsers.length}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <div className="font-medium">{user.email}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BGMI ID:</span>
                          <div className="font-medium">{user.bgmiId}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <div className="font-medium">{user.phone}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">{user.createdAt}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="font-medium">{user.status}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemUserManagement;