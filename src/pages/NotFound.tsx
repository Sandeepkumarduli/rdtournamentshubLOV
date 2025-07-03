import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GamepadIcon, Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="gaming-card-glow max-w-md w-full text-center">
        <CardContent className="p-12">
          <div className="flex justify-center mb-6">
            <GamepadIcon className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-6xl font-black text-primary mb-4">404</h1>
          
          <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
          
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist in our tournament arena.
            <br />
            <span className="text-sm">Route: {location.pathname}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gaming" asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="gaming-outline" asChild>
              <Link to="/login">
                <Search className="h-4 w-4" />
                Go to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
