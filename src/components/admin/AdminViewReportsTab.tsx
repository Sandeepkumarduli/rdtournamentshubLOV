import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { RefreshCw, FileText, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrgReportsView } from '@/hooks/useOrgReportsView';

interface AdminViewReportsTabProps {
  onRefresh: () => void;
}

const AdminViewReportsTab = ({ onRefresh }: AdminViewReportsTabProps) => {
  const { toast } = useToast();
  const { 
    reports, 
    totalReports, 
    loading, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    refetch 
  } = useOrgReportsView();

  const handleRefresh = async () => {
    try {
      await refetch();
      onRefresh();
      toast({
        title: "Success",
        description: "Reports refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh reports",
        variant: "destructive"
      });
    }
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
          <h2 className="text-2xl font-bold">Organization Reports View</h2>
          <p className="text-muted-foreground">View all reports submitted about your organization</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

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
            placeholder="Filter by date"
          />
        </div>

        {(statusFilter !== 'All' || dateFilter) && (
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter('All');
              setDateFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports About Your Organization ({totalReports})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {statusFilter !== 'All' || dateFilter ? 'No reports found matching your filters' : 'No reports found about your organization'}
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
                      <span className="font-medium"> Submitted:</span> {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString()}
                      {report.resolved_at && (
                        <> | <span className="font-medium">Resolved:</span> {new Date(report.resolved_at).toLocaleDateString()} {new Date(report.resolved_at).toLocaleTimeString()}</>
                      )}
                    </div>
                    <p className="text-sm">{report.description.split('\n\n--- Additional Info ---')[0]}</p>
                    {report.resolution && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-success mb-1">System Admin Reply:</p>
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
    </div>
  );
};

export default AdminViewReportsTab;