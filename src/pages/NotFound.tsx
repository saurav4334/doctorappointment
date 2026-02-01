import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="font-display text-8xl font-bold text-primary md:text-9xl">404</h1>
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground md:text-3xl">
            Page Not Found
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/">
              <Button variant="hero" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
