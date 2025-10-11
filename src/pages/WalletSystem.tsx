import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GamepadIcon, 
  Wallet, 
  CreditCard, 
  Shield, 
  Zap,
  ArrowUpDown,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

const WalletSystem = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Bank-grade security with encrypted payment processing"
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Real-time wallet updates and fast transaction processing"
    },
    {
      icon: ArrowUpDown,
      title: "Easy Withdrawals",
      description: "Withdraw your winnings directly to your bank account"
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Methods",
      description: "UPI, Net Banking, Debit/Credit Cards supported"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Add Money",
      description: "Add funds to your rdCoin wallet using secure payment methods",
      icon: Plus
    },
    {
      step: 2,
      title: "Participate",
      description: "Use rdCoins to pay entry fees for tournaments",
      icon: GamepadIcon
    },
    {
      step: 3,
      title: "Win Prizes",
      description: "Earn rdCoins as prize money from tournament victories",
      icon: CheckCircle
    },
    {
      step: 4,
      title: "Withdraw",
      description: "Convert rdCoins back to real money in your bank account",
      icon: Minus
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wallet className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold">rdCoin Wallet System</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Secure digital wallet powered by Razorpay for seamless gaming transactions
            </p>
          </div>

          {/* What is rdCoin */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">What is rdCoin?</h2>
              <p className="text-muted-foreground mb-4">
                rdCoin is RDTH's digital currency designed specifically for gaming transactions. 
                It provides a secure, fast, and convenient way to participate in tournaments, 
                pay entry fees, and receive prize money.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Conversion Rate</span>
                </div>
                <p className="text-sm">1 rdCoin = 1 INR (One rdCoin equals One Indian Rupee)</p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Wallet Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">How It Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {howItWorks.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Partners */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Powered By Industry Leaders</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-blue-50 p-6 rounded-lg mb-4">
                    <h3 className="text-2xl font-bold text-blue-600">Razorpay</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Leading Indian payment gateway trusted by millions for secure transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Limits */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Transaction Limits & Fees</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Deposit Limits</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Minimum Deposit:</span>
                      <span className="font-medium">10 rdCoins</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Maximum Deposit:</span>
                      <span className="font-medium">50,000 rdCoins/day</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Deposit Fee:</span>
                      <span className="font-medium text-success">Free</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Withdrawal Limits</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Minimum Withdrawal:</span>
                      <span className="font-medium">100 rdCoins</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Maximum Withdrawal:</span>
                      <span className="font-medium">25,000 rdCoins/day</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">24-48 hours</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Security & Safety</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">SSL Encryption</h3>
                  <p className="text-sm text-muted-foreground">All transactions are encrypted and secure</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">PCI DSS Compliant</h3>
                  <p className="text-sm text-muted-foreground">Industry standard security protocols</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">24/7 Monitoring</h3>
                  <p className="text-sm text-muted-foreground">Continuous fraud detection and prevention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Start Using rdCoin Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Create your account and get 100 rdCoins as welcome bonus
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/signup">
                  <Wallet className="h-4 w-4 mr-2" />
                  Create Wallet
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

export default WalletSystem;