import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Rocket, Zap, Shield, Code2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OrbitLaunch
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glow border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Deploy in Minutes</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Launch your own{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Arbitrum Orbit chain
              </span>
              {" "}in minutes
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The fastest and easiest way to deploy customizable Layer 2 and Layer 3 chains on Arbitrum's cutting-edge technology stack.
            </p>
            
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/deploy")}
              className="gap-2"
            >
              <Rocket className="h-5 w-5" />
              Launch Dashboard
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Choose OrbitLaunch?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-glow transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Lightning Fast</h4>
                <p className="text-muted-foreground">
                  Deploy your custom Orbit chain in minutes with our streamlined deployment process.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-glow transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Enterprise Ready</h4>
                <p className="text-muted-foreground">
                  Built on Arbitrum's battle-tested infrastructure with security and reliability at its core.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-glow transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Code2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Developer First</h4>
                <p className="text-muted-foreground">
                  Full EVM compatibility with comprehensive tooling and documentation for developers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build the future?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join the next generation of blockchain builders with OrbitLaunch
            </p>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/deploy")}
              className="gap-2"
            >
              <Rocket className="h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 OrbitLaunch. Built for the Arbitrum ecosystem.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
