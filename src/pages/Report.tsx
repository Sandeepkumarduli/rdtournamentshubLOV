import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Mail, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Report = () => {
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
      description: `Your report #${reportId} has been submitted and will be reviewed by our team.`,
    });
    
    setReportData({
      type: '',
      subject: '',
      description: '',
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Report an Issue</h1>
        <p className="text-lg text-muted-foreground">Submit a report or contact our support team</p>
      </div>

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
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <Button type="submit" className="w-full">
                Submit Report
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