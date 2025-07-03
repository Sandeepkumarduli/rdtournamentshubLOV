import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Search, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SystemAdminSidebar from "@/components/SystemAdminSidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const SystemTransactions = () => {
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const mockTransactions = [
    { 
      id: 1, 
      date: "2024-02-01 14:30", 
      amount: 500, 
      sender: "PlayerOne", 
      receiver: "Team Alpha", 
      type: "Team Entry Fee",
      status: "Completed" 
    },
    { 
      id: 2, 
      date: "2024-02-01 12:15", 
      amount: 1000, 
      sender: "OrgAdmin1", 
      receiver: "Tournament Prize Pool", 
      type: "Prize Contribution",
      status: "Completed" 
    },
    { 
      id: 3, 
      date: "2024-01-31 18:45", 
      amount: 250, 
      sender: "GamerPro", 
      receiver: "Squad Elite", 
      type: "Membership Fee",
      status: "Pending" 
    },
    { 
      id: 4, 
      date: "2024-01-31 16:20", 
      amount: 750, 
      sender: "SquadLeader", 
      receiver: "PlayerTwo", 
      type: "Prize Sharing",
      status: "Completed" 
    },
    { 
      id: 5, 
      date: "2024-01-30 11:10", 
      amount: 300, 
      sender: "NightOwl", 
      receiver: "Tournament Entry", 
      type: "Tournament Fee",
      status: "Failed" 
    },
  ];

  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toString().includes(searchTerm)
  );

  const totalAmount = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = mockTransactions.filter(t => t.status === "Completed").length;

  return (
    <div className="min-h-screen flex bg-background">
      <SystemAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Transaction Management</h1>
                <p className="text-muted-foreground">Monitor all platform transactions</p>
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold text-primary">₹{totalAmount.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{mockTransactions.length}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-success">
                      {Math.round((completedTransactions / mockTransactions.length) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by sender, receiver, type, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">₹{transaction.amount}</h3>
                        <Badge variant={
                          transaction.status === "Completed" ? "default" : 
                          transaction.status === "Pending" ? "secondary" : "destructive"
                        }>
                          {transaction.status}
                        </Badge>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <div className="font-medium">{transaction.date}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sender:</span>
                          <div className="font-medium">{transaction.sender}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Receiver:</span>
                          <div className="font-medium">{transaction.receiver}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium">{transaction.type}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemTransactions;