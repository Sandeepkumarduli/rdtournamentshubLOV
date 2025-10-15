import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { 
  GamepadIcon, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Trophy,
  Wallet
} from "lucide-react";

const Rules = () => {
  const { user } = useAuth();
  const gameplayRules = [
    "No use of hacks, cheats, or third-party software",
    "Teams must have 1-4 active players",
    "All players must be present at tournament start time",
    "Mobile devices only - no emulators allowed",
    "Fair play and sportsmanship required at all times",
    "Follow all BGMI official rules and regulations"
  ];

  const tournamentRules = [
    "Entry fees must be paid before tournament start",
    "Teams cannot change players during ongoing tournaments",
    "Room IDs and passwords will be shared 15 minutes before match",
    "Late entries will result in disqualification",
    "Disputes must be reported immediately with proof",
    "Admin decisions are final and binding"
  ];

  const walletRules = [
    "rdCoins are non-refundable digital currency",
    "Minimum withdrawal amount is 100 rdCoins",
    "Winnings will be credited within 24-48 hours",
    "Transaction fees may apply for withdrawals",
    "Account verification required for large transactions",
    "Suspicious activities will result in account suspension"
  ];

  const violations = [
    {
      type: "Minor Violations",
      icon: AlertTriangle,
      color: "text-warning",
      examples: ["Late entry", "Minor unsportsmanlike conduct", "Technical issues"],
      penalty: "Warning or temporary suspension"
    },
    {
      type: "Major Violations", 
      icon: XCircle,
      color: "text-destructive",
      examples: ["Cheating", "Account sharing", "Harassment", "Multiple accounts"],
      penalty: "Permanent ban and forfeiture of winnings"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GamepadIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">RDTH</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Button variant="default" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Rules & Regulations</h1>
            <p className="text-xl text-muted-foreground">
              Terms and conditions for participating in RDTH tournaments
            </p>
          </div>

          {/* Gameplay Rules */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <GamepadIcon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Gameplay Rules</h2>
              </div>
              <ul className="space-y-3">
                {gameplayRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tournament Rules */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Tournament Rules</h2>
              </div>
              <ul className="space-y-3">
                {tournamentRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Wallet & Payment Rules */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Wallet & Payment Rules</h2>
              </div>
              <ul className="space-y-3">
                {walletRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Violations & Penalties */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Violations & Penalties</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {violations.map((violation, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <violation.icon className={`h-6 w-6 ${violation.color}`} />
                      <h3 className="text-lg font-semibold">{violation.type}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Examples:</h4>
                        <ul className="space-y-1">
                          {violation.examples.map((example, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {example}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Penalty:</h4>
                        <p className="text-sm text-muted-foreground">{violation.penalty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Age & Eligibility */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Age & Eligibility</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Participants must be at least 16 years old</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Valid government ID required for prize withdrawals</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>One account per person - multiple accounts prohibited</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Account verification may be required for large winnings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agreement */}
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Agreement</h2>
              <p className="text-muted-foreground mb-6">
                By creating an account and participating in tournaments, you agree to abide by all the rules and regulations stated above. 
                RDTH reserves the right to modify these rules at any time with prior notice.
              </p>
              <div className="flex gap-4 justify-center">
                {user ? (
                  <Button asChild>
                    <Link to="/dashboard">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/signup">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      I Agree - Create Account
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/">← Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rules;