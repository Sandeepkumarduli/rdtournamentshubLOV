import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  RefreshCw,
  MessageSquare,
  Flag,
  Clock,
  Trash2,
  CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useReports } from "@/hooks/useReports";

const SystemReports = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, loading: reportsLoading, refetch, resolveReport } = useReports();

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

  const handleResolve = async (reportId: string) => {
    if (!resolution.trim()) {
      toast({
        title: "Resolution Required",
        description: "Please provide a resolution before marking as resolved",
        variant: "destructive"
      });
      return;
    }

    const result = await resolveReport(reportId, resolution);
    if (result.success) {
      toast({
        title: "Report Resolved",
        description: "Issue has been marked as resolved with your solution",
        variant: "default"
      });
      setSelectedReport(null);
      setResolution("");
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to resolve report",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReport = (reportId: string) => {
    toast({
      title: "Report Deleted",
      description: "Report has been permanently removed from the system",
      variant: "destructive"
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading || reportsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const mockReports = [
    { 
      id: "RPT001", 
      type: "Tournament Issue", 
      title: "Prize distribution delayed", 
      description: "Tournament winners haven't received their prizes after 3 days", 
      reporter: "PlayerOne", 
      reportedEntity: "Summer Championship", 
      date: "2024-02-01", 
      status: "Pending",
      priority: "High",
      category: "Tournament"
    },
    { 
      id: "RPT002", 
      type: "ORG Complaint", 
      title: "Unfair team selection", 
      description: "Admin showing favoritism in team selections for major tournaments", 
      reporter: "GamerPro", 
      reportedEntity: "Elite Gaming Org", 
      date: "2024-01-31", 
      status: "Pending",
      priority: "Medium",
      category: "Organization"
    },
    { 
      id: "RPT003", 
      type: "Tournament Issue", 
      title: "Server lag during finals", 
      description: "Multiple players experienced severe lag during championship finals", 
      reporter: "SquadLeader", 
      reportedEntity: "Winter Cup Finals", 
      date: "2024-01-30", 
      status: "Resolved",
      priority: "High",
      category: "Tournament"
    },
    { 
      id: "RPT004", 
      type: "ORG Complaint", 
      title: "Inappropriate conduct", 
      description: "Admin using inappropriate language in team communications", 
      reporter: "NightOwl", 
      reportedEntity: "Pro Gaming Hub", 
      date: "2024-01-29", 
      status: "Pending",
      priority: "Medium",
      category: "Organization"
    },
    { 
      id: "RPT005", 
      type: "Technical Issue", 
      title: "Payment gateway error", 
      description: "Unable to process tournament entry fees, payment keeps failing", 
      reporter: "TeamCaptain", 
      reportedEntity: "Platform Payment System", 
      date: "2024-01-28", 
      status: "Pending",
      priority: "High",
      category: "Technical"
    },
  ];

  const filteredReports = mockReports
    .filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedEntity.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(report => statusFilter === "All" || report.status === statusFilter)
    .filter(report => !dateFilter || report.date === dateFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openReports = mockReports.filter(report => report.status === "Pending").length;
  const highPriorityReports = mockReports.filter(report => report.priority === "High").length;

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Reports Management</h1>
                <p className="text-muted-foreground">Review and resolve platform issues</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-warning text-warning">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {openReports} Open
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
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Reports</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold text-primary">{mockReports.length}</p>
                  </div>
                  <Flag className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                    <p className="text-2xl font-bold text-warning">{openReports}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold text-destructive">{highPriorityReports}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-success">
                      {mockReports.filter(report => report.status === "Resolved").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by title, description, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                     <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-muted-foreground">#{report.id}</span>
                        <h3 className="text-lg font-semibold">{report.title}</h3>
                        <Badge variant={
                          report.status === "Pending" ? "destructive" : "default"
                        }>
                          {report.status}
                        </Badge>
                        <Badge variant={
                          report.priority === "High" ? "destructive" : "outline"
                        }>
                          {report.priority}
                        </Badge>
                        <Badge variant="outline">{report.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Reporter:</span>
                          <div className="font-medium">{report.reporter}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reported Entity:</span>
                          <div className="font-medium">{report.reportedEntity}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <div className="font-medium">{report.date}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium">{report.type}</div>
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <span className="text-sm text-muted-foreground">Description:</span>
                        <p className="mt-1 text-sm">{report.description}</p>
                      </div>
                      
                      {selectedReport === report.id && report.status !== "Resolved" && (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Provide your resolution details..."
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleResolve(report.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark as Resolved
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReport(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {report.status !== "Resolved" && selectedReport !== report.id && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReport(report.id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Resolve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemReports;