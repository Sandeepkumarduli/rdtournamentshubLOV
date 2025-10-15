import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GamepadIcon, 
  Trophy, 
  Users, 
  Wallet, 
  Shield, 
  Zap,
  Target,
  Star,
  RefreshCw
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Trophy,
      title: "Tournament Management",
      description: "Create and join competitive BGMI tournaments with real prizes"
    },
    {
      icon: Users,
      title: "Team System",
      description: "Form teams, invite players, and compete together"
    },
    {
      icon: Wallet,
      title: "rdCoin Wallet",
      description: "Integrated wallet system for entry fees and prize money"
    },
    {
      icon: Shield,
      title: "Admin Control",
      description: "Comprehensive admin tools for tournament oversight"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live tournament progress and instant notifications"
    },
    {
      icon: Target,
      title: "Fair Play",
      description: "Anti-cheat measures and fair play enforcement"
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
              <span className="text-xl font-bold">
                RDTH
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/tournament-guide" className="text-muted-foreground hover:text-primary">
                Tournament Guide
              </Link>
              <Link to="/rules" className="text-muted-foreground hover:text-primary">
                Rules
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
              <Link to="/wallet-system" className="text-muted-foreground hover:text-primary">
                rdCoin Wallet
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="gaming-outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gaming" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-text mb-6 leading-tight">
            Professional BGMI
            <br />
            Tournament Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the ultimate competitive gaming experience. Create teams, compete in tournaments, 
            and win real prizes with our integrated rdCoin system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                <Star className="h-5 w-5" />
                Start Gaming Now
              </Link>
            </Button>
            <Button variant="gaming-outline" size="xl" asChild>
              <Link to="/login">
                <GamepadIcon className="h-5 w-5" />
                Login to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Gaming Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for competitive BGMI tournaments
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="gaming-card hover:gaming-card-glow transition-all duration-300">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="gaming-card">
            <div className="p-8">
              <div className="text-4xl font-black text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
          </div>
          <div className="gaming-card">
            <div className="p-8">
              <div className="text-4xl font-black text-accent mb-2">500+</div>
              <div className="text-muted-foreground">Tournaments Hosted</div>
            </div>
          </div>
          <div className="gaming-card">
            <div className="p-8">
              <div className="text-4xl font-black text-gaming-gold mb-2">2M+</div>
              <div className="text-muted-foreground">rdCoins Prize Money Distributed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="gaming-card-glow max-w-2xl mx-auto p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Compete?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of players in the most competitive BGMI tournament platform. 
            Start your journey to becoming a champion today.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">
              <Trophy className="h-5 w-5" />
              Create Account Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GamepadIcon className="h-6 w-6 text-primary" />
                <span className="font-bold">RDTH</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate destination for competitive BGMI tournaments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/tournament-guide" className="block hover:text-primary">Tournament Guide</Link>
                <Link to="/rules" className="block hover:text-primary">Rules & Regulations</Link>
                <Link to="/contact" className="block hover:text-primary">Contact Us</Link>
                <Link to="/wallet-system" className="block hover:text-primary">rdCoin Wallet</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/login" className="block hover:text-primary">Login</Link>
                <Link to="/signup" className="block hover:text-primary">Sign Up</Link>
                <div>Wallet</div>
                <div>Profile</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Admin</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/admin-login" className="block hover:text-primary">Admin Portal</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 RDTH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
