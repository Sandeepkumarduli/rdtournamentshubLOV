import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { 
  GamepadIcon, 
  Trophy, 
  Users, 
  Target,
  CheckCircle,
  ArrowRight,
  User,
  Calendar
} from "lucide-react";

const TournamentGuide = () => {
  const { user } = useAuth();
  const steps = [
    {
      icon: User,
      title: "Create Account",
      description: "Sign up on RDTH platform with your BGMI ID and phone number"
    },
    {
      icon: Trophy,
      title: "Browse Tournaments",
      description: "Explore available tournaments and check entry requirements"
    },
    {
      icon: Users,
      title: "Form Team",
      description: "Create or join a team with up to 4 players"
    },
    {
      icon: Target,
      title: "Pay Entry Fee",
      description: "Use rdCoins from your wallet to pay tournament entry fee"
    },
    {
      icon: CheckCircle,
      title: "Get Ready",
      description: "Wait for room ID and password from tournament organizers"
    },
    {
      icon: Calendar,
      title: "Play & Win",
      description: "Compete in the tournament and win amazing prizes"
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
              <span className="text-xl font-bold">RDTH - RD Tournaments Hub</span>
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
            <h1 className="text-4xl font-bold mb-4">Tournament Registration Guide</h1>
            <p className="text-xl text-muted-foreground">
              Learn how to register and participate in BGMI tournaments on RDTH platform
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6">
                <CardContent className="flex items-start gap-6 p-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Requirements */}
          <Card className="mt-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Player Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Valid BGMI account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Active phone number</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Sufficient rdCoins for entry fee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Team of 1-4 players</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Technical Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Stable internet connection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Latest BGMI version</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Discord for communication</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Screen recording software</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-6">
              Create your account now and join the competitive gaming community
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">
                    <Trophy className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/signup">
                    <Trophy className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">← Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentGuide;