import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemAdminRequests = () => {
  const [loading, setLoading] = useState(true);
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

  const handleApprove = (requestId: number) => {
    toast({
      title: "Request Approved",
      description: "Admin access has been granted to the user",
      variant: "default"
    });
  };

  const handleReject = (requestId: number) => {
    toast({
      title: "Request Rejected",
      description: "Admin request has been denied",
      variant: "destructive"
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const mockAdminRequests = [
    { 
      id: 1, 
      username: "ModeratorOne", 
      email: "mod1@example.com", 
      reason: "Experienced tournament organizer with 3+ years in esports management", 
      status: "Pending", 
      date: "2024-01-30",
      bgmiId: "MOD123456",
      experience: "3 years"
    },
    { 
      id: 2, 
      username: "EventManager", 
      email: "event@example.com", 
      reason: "Community leader with 2+ years experience organizing local tournaments", 
      status: "Pending", 
      date: "2024-01-29",
      bgmiId: "EVT789012",
      experience: "2 years"
    },
    { 
      id: 3, 
      username: "TourneyHost", 
      email: "host@example.com", 
      reason: "Professional esports organizer working with major brands", 
      status: "Approved", 
      date: "2024-01-28",
      bgmiId: "HST345678",
      experience: "5 years"
    },
    { 
      id: 4, 
      username: "GameMaster", 
      email: "master@example.com", 
      reason: "Former professional player turned tournament coordinator", 
      status: "Rejected", 
      date: "2024-01-27",
      bgmiId: "MST901234",
      experience: "4 years"
    },
  ];

  const pendingRequests = mockAdminRequests.filter(req => req.status === "Pending");

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Admin Requests</h1>
                <p className="text-muted-foreground">Review and manage admin access requests</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-warning text-warning">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingRequests.length} Pending
                </Badge>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{mockAdminRequests.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-warning">{pendingRequests.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-success">
                      {mockAdminRequests.filter(req => req.status === "Approved").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-destructive">
                      {mockAdminRequests.filter(req => req.status === "Rejected").length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {mockAdminRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{request.username}</h3>
                        <Badge variant={
                          request.status === "Pending" ? "secondary" :
                          request.status === "Approved" ? "default" : "destructive"
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <div className="font-medium">{request.email}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BGMI ID:</span>
                          <div className="font-medium">{request.bgmiId}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <div className="font-medium">{request.experience}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Requested:</span>
                          <div className="font-medium">{request.date}</div>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <span className="text-sm text-muted-foreground">Reason:</span>
                        <p className="mt-1 text-sm">{request.reason}</p>
                      </div>
                    </div>
                    {request.status === "Pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockAdminRequests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No admin requests</h3>
                <p className="text-muted-foreground">All requests have been processed</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemAdminRequests;