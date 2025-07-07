import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  RefreshCw,
  MessageSquare,
  Flag,
  Clock,
  Trash2,
  CalendarDays,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useReports } from "@/hooks/useReports";

const SystemReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [dateFilter, setDateFilter] = useState("");
  const [viewDetailsModal, setViewDetailsModal] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<string | null>(null);
  const { toast } = useToast();
  const { reports, loading: reportsLoading, refetch, resolveReport, deleteReport } = useReports();

  const handleResolve = async (reportId: string) => {
    const resolution = resolutions[reportId];
    if (!resolution?.trim()) {
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
      setResolveModal(null);
      setResolutions(prev => ({ ...prev, [reportId]: "" }));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to resolve report",
        variant: "destructive"
      });
    }
  };

  const formatDescription = (description: string) => {
    // Split by "--- Additional Info ---" to separate main description from additional info
    const parts = description.split('\n\n--- Additional Info ---');
    const mainDescription = parts[0];
    const additionalInfo = parts[1];

    return {
      mainDescription,
      additionalInfo
    };
  };

  const handleDeleteReport = async (reportId: string) => {
    const result = await deleteReport(reportId);
    if (result.success) {
      toast({
        title: "Report Deleted",
        description: "Report has been permanently removed from the system",
      });
    } else {
      toast({
        title: "Error",  
        description: result.error || "Failed to delete report",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Reports data fetched successfully", 
    });
  };

  if (reportsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const filteredReports = reports
    .filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedEntity.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(report => {
      return report.status.toLowerCase() === statusFilter.toLowerCase();
    })
    .filter(report => {
      if (!dateFilter) return true;
      const reportDate = new Date(report.date).toISOString().split('T')[0];
      return reportDate === dateFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openReports = reports.filter(report => report.status === "Pending").length;
  const highPriorityReports = reports.filter(report => report.priority === "High").length;

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
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "Pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("Pending")}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </Button>
              <Button
                variant={statusFilter === "Resolved" ? "default" : "outline"}
                onClick={() => setStatusFilter("Resolved")}
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved
              </Button>
            </div>
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
                    <p className="text-2xl font-bold text-primary">{reports.length}</p>
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
                      {reports.filter(report => report.status === "Resolved").length}
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
                       <div className="flex gap-2 mb-4">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setViewDetailsModal(report.id)}
                         >
                           <Eye className="h-4 w-4 mr-2" />
                           View Details
                         </Button>
                       </div>
                    </div>
                    {report.status !== "Resolved" && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setResolveModal(report.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

          {/* View Details Modal */}
          <Dialog open={!!viewDetailsModal} onOpenChange={() => setViewDetailsModal(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
              </DialogHeader>
              {viewDetailsModal && (
                <div className="space-y-4">
                  {(() => {
                    const report = reports.find(r => r.id === viewDetailsModal);
                    if (!report) return null;
                    
                    const { mainDescription, additionalInfo } = formatDescription(report.description);
                    
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Report ID:</span>
                            <p>#{report.id}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Title:</span>
                            <p>{report.title}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Reporter:</span>
                            <p>{report.reporter}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Reported Entity:</span>
                            <p>{report.reportedEntity}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Type:</span>
                            <p>{report.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Priority:</span>
                            <Badge variant={report.priority === "High" ? "destructive" : "outline"}>
                              {report.priority}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Status:</span>
                            <Badge variant={report.status === "Pending" ? "destructive" : "default"}>
                              {report.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Date:</span>
                            <p>{report.date}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-muted-foreground">Description:</span>
                            <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{mainDescription}</p>
                            </div>
                          </div>
                          
                          {additionalInfo && (
                            <div>
                              <span className="font-medium text-muted-foreground">Additional Information:</span>
                              <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap font-mono">{additionalInfo}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Resolve Modal */}
          <Dialog open={!!resolveModal} onOpenChange={() => setResolveModal(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Resolve Report</DialogTitle>
              </DialogHeader>
              {resolveModal && (
                <div className="space-y-4">
                  {(() => {
                    const report = reports.find(r => r.id === resolveModal);
                    if (!report) return null;
                    
                    return (
                      <>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">Report: {report.title}</p>
                          <p className="text-sm text-muted-foreground">Reporter: {report.reporter}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resolution Message:</label>
                          <Textarea
                            placeholder="Provide detailed resolution information..."
                            value={resolutions[report.id] || ""}
                            onChange={(e) => setResolutions(prev => ({ ...prev, [report.id]: e.target.value }))}
                            rows={4}
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setResolveModal(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleResolve(report.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Resolved
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default SystemReports;