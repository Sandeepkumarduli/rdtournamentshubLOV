import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertTriangle, Mail, Phone, MessageSquare, RefreshCw, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReportSubmission } from '@/hooks/useReportSubmission';
import { useUserReports } from '@/hooks/useUserReports';
import { useOrgNames } from '@/hooks/useOrgNames';

const Report = () => {
  const [reportData, setReportData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium',
    orgName: ''
  });
  const { toast } = useToast();
  const { loading, submitReport } = useReportSubmission();
  const { reports, totalReports, loading: reportsLoading, currentPage, totalPages, setCurrentPage, refetch } = useUserReports();
  const { orgNames, loading: orgNamesLoading } = useOrgNames();

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.type || !reportData.subject || !reportData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (reportData.type === 'org' && !reportData.orgName) {
      toast({
        title: "Error",
        description: "Please enter the ORG Name when reporting on an organization",
        variant: "destructive"
      });
      return;
    }

    const result = await submitReport({
      type: reportData.type,
      title: reportData.subject,
      description: reportData.description,
      priority: reportData.priority,
      category: reportData.type,
      orgName: reportData.orgName || undefined,
    });

    if (result.success) {
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted and will be reviewed by our team.",
      });
      
      setReportData({
        type: '',
        subject: '',
        description: '',
        priority: 'medium',
        orgName: ''
      });
      
      // Refresh the reports list
      refetch();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Success",
      description: "Reports updated successfully",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'default';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Report an Issue</h1>
          <p className="text-lg text-muted-foreground">Submit a report or contact our support team</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* My Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Reports ({totalReports})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportsLoading ? (
            <div className="text-center py-4">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No reports submitted yet
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{report.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Type:</span> {report.type} | 
                      <span className="font-medium"> Submitted:</span> {new Date(report.created_at).toLocaleDateString()}
                      {report.resolved_at && (
                        <> | <span className="font-medium">Resolved:</span> {new Date(report.resolved_at).toLocaleDateString()}</>
                      )}
                    </div>
                    <p className="text-sm">{report.description.split('\n\n--- Additional Info ---')[0]}</p>
                    {report.resolution && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-success mb-1">Resolution:</p>
                        <p className="text-sm">{report.resolution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Submit a Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={reportData.type} onValueChange={(value) => setReportData({...reportData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament Issue</SelectItem>
                    <SelectItem value="player">Player Misconduct</SelectItem>
                    <SelectItem value="payment">Payment Problem</SelectItem>
                    <SelectItem value="technical">Technical Bug</SelectItem>
                    <SelectItem value="org">Report on ORG</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportData.type === 'org' && (
                <div className="space-y-2">
                  <Label htmlFor="orgName">ORG Name</Label>
                  <Select value={reportData.orgName} onValueChange={(value) => setReportData({...reportData, orgName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={orgNamesLoading ? "Loading organizations..." : "Select an organization"} />
                    </SelectTrigger>
                    <SelectContent>
                      {orgNames.map((orgName) => (
                        <SelectItem key={orgName} value={orgName}>
                          {orgName}
                        </SelectItem>
                      ))}
                      {orgNames.length === 0 && !orgNamesLoading && (
                        <SelectItem value="" disabled>
                          No organizations found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={reportData.priority} onValueChange={(value) => setReportData({...reportData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={reportData.subject}
                  onChange={(e) => setReportData({...reportData, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={reportData.description}
                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                  placeholder="Please provide detailed information about the issue..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Direct Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@rdth.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support Hours</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                <p>Saturday: 10:00 AM - 6:00 PM</p>
                <p>Sunday: 12:00 PM - 5:00 PM</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Expected Response Time</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Urgent issues: Within 2 hours</p>
                <p>• High priority: Within 24 hours</p>
                <p>• Medium/Low priority: Within 48 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;