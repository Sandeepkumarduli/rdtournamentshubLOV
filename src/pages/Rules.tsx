import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Users, Trophy, DollarSign, Clock } from 'lucide-react';

const Rules = () => {
  const sections = [
    {
      title: "General Platform Rules",
      icon: Shield,
      rules: [
        "Users must provide accurate information during registration",
        "One account per person - multiple accounts are prohibited",
        "Users must be 13 years or older to use the platform",
        "Respectful behavior is required in all communications",
        "Account sharing or selling is strictly forbidden"
      ]
    },
    {
      title: "Tournament Participation",
      icon: Trophy,
      rules: [
        "All participants must have a valid BGMI account",
        "Team members must be confirmed before tournament starts",
        "Substitutions are only allowed before registration deadline",
        "Late arrivals may be disqualified at organizer's discretion",
        "Multiple registrations for the same tournament are not allowed"
      ]
    },
    {
      title: "Fair Play & Cheating",
      icon: AlertTriangle,
      rules: [
        "Use of any third-party cheating software is prohibited",
        "Team killing or griefing teammates will result in ban",
        "Exploiting game bugs or glitches is not allowed",
        "Sharing room details with non-participants is forbidden",
        "All gameplay must be recorded for verification if requested"
      ]
    },
    {
      title: "Payment & Refunds",
      icon: DollarSign,
      rules: [
        "Entry fees are non-refundable once tournament starts",
        "Refunds may be issued if tournament is cancelled by organizers",
        "Prize money will be distributed within 24-48 hours",
        "Disputed payments will be reviewed by admin team",
        "Users are responsible for maintaining sufficient wallet balance"
      ]
    },
    {
      title: "Team & Communication",
      icon: Users,
      rules: [
        "Team leaders are responsible for all team member actions",
        "Toxic behavior in team chat will result in penalties",
        "Teams must have all required members at tournament time",
        "Name changes during active tournaments are not permitted",
        "Team disputes should be reported to administrators"
      ]
    },
    {
      title: "Timing & Scheduling",
      icon: Clock,
      rules: [
        "All times are displayed in Indian Standard Time (IST)",
        "Players must join the room within 10 minutes of start time",
        "Tournament delays due to technical issues will be announced",
        "Rescheduling is only possible in exceptional circumstances",
        "No-shows will forfeit entry fees and face potential penalties"
      ]
    }
  ];

  const violations = [
    {
      level: "Warning",
      description: "Minor rule violations or first-time offenses",
      consequences: "Official warning and monitoring"
    },
    {
      level: "Temporary Ban",
      description: "Repeated violations or moderate misconduct",
      consequences: "1-7 day platform suspension"
    },
    {
      level: "Permanent Ban",
      description: "Serious violations, cheating, or multiple offenses",
      consequences: "Permanent account termination"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Rules & Regulations</h1>
        <p className="text-lg text-muted-foreground">Please read and understand all platform rules before participating</p>
      </div>

      {/* Platform Rules */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Violation Consequences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Violation Consequences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {violations.map((violation, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    violation.level === "Warning" ? "secondary" :
                    violation.level === "Temporary Ban" ? "destructive" : "outline"
                  }>
                    {violation.level}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1">{violation.description}</p>
                <p className="text-sm text-muted-foreground">{violation.consequences}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact for Disputes */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes & Appeals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you believe you have been unfairly penalized or have a dispute regarding these rules, 
              you may appeal within 48 hours of the incident.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Appeal Email:</strong> appeals@rdth.com</p>
              <p className="text-sm"><strong>Include:</strong> Your username, incident details, and supporting evidence</p>
              <p className="text-sm"><strong>Response Time:</strong> All appeals will be reviewed within 72 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agreement */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="font-medium">Agreement</p>
            <p className="text-sm text-muted-foreground">
              By using RDTH platform, you agree to abide by all rules and regulations stated above. 
              These rules may be updated at any time, and users will be notified of changes.
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rules;