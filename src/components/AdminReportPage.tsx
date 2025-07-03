import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Mail, Phone, MessageSquare, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminReportPage = () => {
  const [reportData, setReportData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate unique ID for report
    const reportId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    toast({
      title: "Report Submitted",
      description: `Your report #${reportId} has been submitted to System Admin for review.`,
    });
    
    setReportData({
      type: '',
      subject: '',
      description: '',
      priority: 'medium'
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Data Refreshed",
      description: "Latest report data loaded",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">ORG Report Center</h1>
          <p className="text-lg text-muted-foreground">Report issues or contact system administration</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Submit Report to System Admin
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
                    <SelectItem value="tournament">Tournament Rule Violation</SelectItem>
                    <SelectItem value="user">User Misconduct</SelectItem>
                    <SelectItem value="payment">Payment System Issue</SelectItem>
                    <SelectItem value="technical">Technical Bug</SelectItem>
                    <SelectItem value="system">System Policy Clarification</SelectItem>
                    <SelectItem value="urgent">Urgent Platform Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={reportData.priority} onValueChange={(value) => setReportData({...reportData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent - Immediate Attention</SelectItem>
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
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={reportData.description}
                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                  placeholder="Please provide detailed information about the issue, including user IDs, tournament names, timestamps, etc."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Report to System Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ORG Admin Contact Info & Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              System Admin Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Direct Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">System Admin Email</p>
                    <p className="text-sm text-muted-foreground">system.admin@rdth.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Emergency Hotline</p>
                    <p className="text-sm text-muted-foreground">+91 9876543000</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Reporting Guidelines</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>User Issues:</strong> Include user ID and specific violation details</p>
                <p>• <strong>Tournament Issues:</strong> Provide tournament ID, date, and specific problems</p>
                <p>• <strong>Technical Issues:</strong> Include error messages and steps to reproduce</p>
                <p>• <strong>Urgent Issues:</strong> Call emergency hotline for immediate response</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Response Time</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Urgent issues: Within 30 minutes</p>
                <p>• High priority: Within 2 hours</p>
                <p>• Medium priority: Within 12 hours</p>
                <p>• Low priority: Within 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportPage;