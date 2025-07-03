import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Wallet, 
  Calendar, 
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const TournamentGuide = () => {
  const steps = [
    {
      title: "Create an Account",
      description: "Sign up and verify your BGMI ID and phone number",
      icon: CheckCircle,
      status: "required"
    },
    {
      title: "Add rdCoins to Wallet",
      description: "Load your wallet with rdCoins to pay entry fees",
      icon: Wallet,
      status: "required"
    },
    {
      title: "Form or Join a Team",
      description: "Create a new team or join an existing one (for squad/duo tournaments)",
      icon: Users,
      status: "optional"
    },
    {
      title: "Browse Tournaments",
      description: "Find tournaments that match your skill level and preferences",
      icon: Trophy,
      status: "required"
    },
    {
      title: "Register for Tournament",
      description: "Pay the entry fee and confirm your participation",
      icon: Target,
      status: "required"
    },
    {
      title: "Join Game Room",
      description: "Get room ID and password before tournament starts",
      icon: Calendar,
      status: "required"
    }
  ];

  const tournamentTypes = [
    {
      type: "Solo",
      description: "Individual competition",
      teamSize: "1 player",
      entryFee: "25-100 rdCoins"
    },
    {
      type: "Duo",
      description: "Two-player teams",
      teamSize: "2 players",
      entryFee: "50-150 rdCoins"
    },
    {
      type: "Squad",
      description: "Four-player teams",
      teamSize: "4 players",
      entryFee: "100-500 rdCoins"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Tournament Registration Guide</h1>
        <p className="text-lg text-muted-foreground">Learn how to participate in RDTH tournaments</p>
      </div>

      {/* Tournament Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {tournamentTypes.map((tournament, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{tournament.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{tournament.description}</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Team Size:</strong> {tournament.teamSize}</p>
                  <p><strong>Entry Fee:</strong> {tournament.entryFee}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step by Step Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <Badge variant={step.status === "required" ? "default" : "secondary"}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Rules & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Registration Deadline</p>
                <p className="text-sm text-muted-foreground">You must register at least 30 minutes before tournament start time</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Team Requirements</p>
                <p className="text-sm text-muted-foreground">All team members must be registered and have sufficient rdCoins</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Room Details</p>
                <p className="text-sm text-muted-foreground">Room ID and password will be shared 15 minutes before tournament starts</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Fair Play</p>
                <p className="text-sm text-muted-foreground">Any form of cheating or misconduct will result in immediate disqualification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Need Help? */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              If you have any questions about tournament registration, please contact our support team:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm">Email: support@rdth.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Phone: +91 9876543210</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentGuide;