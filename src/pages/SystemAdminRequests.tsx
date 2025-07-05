import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Clock,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ChatDialog from "@/components/ChatDialog";
import { useAdminRequests } from "@/hooks/useAdminRequests";

const SystemAdminRequests = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [chatAdmin, setChatAdmin] = useState<string | null>(null);
  const { toast } = useToast();
  const { requests, loading: requestsLoading, refetch, approveRequest, rejectRequest } = useAdminRequests();

  const handleApprove = async (requestId: string) => {
    const result = await approveRequest(requestId);
    if (result.success) {
      toast({
        title: "Request Approved",
        description: "Admin access has been granted to the user",
        variant: "default"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const result = await rejectRequest(requestId);
    if (result.success) {
      toast({
        title: "Request Rejected",
        description: "Admin request has been denied",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject request",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed", 
      description: "Admin requests fetched successfully",
    });
  };

  if (requestsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const pendingRequests = requests.filter(req => req.status === "pending");

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Org Admin Requests</h1>
                <p className="text-muted-foreground">Review and manage organization admin access requests</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-warning text-warning">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingRequests.length} Pending
                </Badge>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Requests</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{requests.length}</p>
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
                      {requests.filter(req => req.status === "approved").length}
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
                      {requests.filter(req => req.status === "rejected").length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {requests
              .filter(request => statusFilter === "All" || request.status === statusFilter)
              .map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{request.username}</h3>
                        <Badge variant={
                          request.status === "pending" ? "secondary" :
                          request.status === "approved" ? "default" : "destructive"
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                    {request.status === "pending" && (
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
                    {request.status === "approved" && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChatAdmin(request.username)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {requests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No admin requests</h3>
                <p className="text-muted-foreground">All requests have been processed</p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Chat Dialog */}
        <ChatDialog
          isOpen={!!chatAdmin}
          onClose={() => setChatAdmin(null)}
          recipientName={chatAdmin || ''}
          recipientType="admin"
        />
      </div>
    </div>
  );
};

export default SystemAdminRequests;