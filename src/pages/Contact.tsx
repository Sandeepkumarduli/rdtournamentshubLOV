import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GamepadIcon, 
  MapPin, 
  Mail, 
  Phone, 
  Clock,
  Users,
  Trophy,
  Target,
  MessageCircle
} from "lucide-react";

const Contact = () => {
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
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Get in touch with the RDTH team for support and inquiries
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-muted-foreground">
                        RD Tournaments Hub Pvt. Ltd.<br />
                        Building No. 42, Cyber City<br />
                        Sector 24, Gurugram<br />
                        Haryana 122016, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">support@rdth.in</p>
                      <p className="text-muted-foreground">business@rdth.in</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">+91 9876-543-210</p>
                      <p className="text-muted-foreground">+91 8765-432-109</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Support Hours</h3>
                      <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 8:00 PM</p>
                      <p className="text-muted-foreground">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Platform */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">About RDTH Platform</h2>
                <p className="text-muted-foreground mb-6">
                  RDTH (RD Tournaments Hub) is India's premier BGMI tournament platform, 
                  connecting thousands of gamers and providing a competitive environment 
                  for esports enthusiasts.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>10,000+ Active Players</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>500+ Tournaments Hosted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span>₹2M+ Prize Money Distributed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media & Quick Contact */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Connect With Us</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Discord</h3>
                  <p className="text-sm text-muted-foreground">Join our gaming community</p>
                  <Button variant="outline" size="sm">
                    discord.gg/rdth
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <GamepadIcon className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">YouTube</h3>
                  <p className="text-sm text-muted-foreground">Tournament highlights & guides</p>
                  <Button variant="outline" size="sm">
                    @RDTHOfficial
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Users className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="text-sm text-muted-foreground">Latest updates & events</p>
                  <Button variant="outline" size="sm">
                    @rdth_official
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I register for tournaments?</h3>
                  <p className="text-muted-foreground">Create an account, add funds to your wallet, and browse available tournaments to register.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">When do I receive my winnings?</h3>
                  <p className="text-muted-foreground">Prize money is credited to your wallet within 24-48 hours after tournament completion.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What payment methods are supported?</h3>
                  <p className="text-muted-foreground">We support UPI, Net Banking, and major debit/credit cards through our secure payment gateway.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How can I report issues during tournaments?</h3>
                  <p className="text-muted-foreground">Use the in-platform report feature or contact our support team immediately during tournaments.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Gaming?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of players in the most competitive BGMI platform
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/signup">
                  <Trophy className="h-4 w-4 mr-2" />
                  Create Account
                </Link>
              </Button>
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

export default Contact;