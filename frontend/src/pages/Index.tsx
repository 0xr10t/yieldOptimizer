import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WalletModal from "@/components/WalletModal";
import FeatureCard from "@/components/FeatureCard";
import { useScrollAnimation, useIntersectionObserver } from "@/hooks/useScrollAnimation";
import heroImage from "@/assets/hero-defi.jpg";
import { 
  Zap, 
  Cpu, 
  ArrowRightLeft, 
  Shield, 
  Users, 
  Key,
  Wallet,
  BookOpen,
  TrendingUp,
  Lock,
  Globe,
  Star,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate();
  const scrollY = useScrollAnimation();
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [featuresRef, featuresVisible] = useIntersectionObserver();
  
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in-scroll');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, [scrollY]);

  const features = [
    {
      icon: Zap,
      title: "Lightning Speed",
      description: "Execute transactions in seconds, not minutes. Our optimized protocol ensures your deposits and withdrawals happen at blazing speeds.",
      delay: 100
    },
    {
      icon: Cpu,
      title: "Future-Ready Technology",
      description: "Built on cutting-edge blockchain infrastructure that evolves with the rapidly changing DeFi landscape. Today's tech, tomorrow's standards.",
      delay: 200
    },
    {
      icon: ArrowRightLeft,
      title: "Seamless Money Movement",
      description: "Move your assets effortlessly across chains with our advanced cross-chain bridge technology powered by Circle's CCTP.",
      delay: 300
    },
    {
      icon: Shield,
      title: "Stable Coin Focus",
      description: "Optimized specifically for USDC and USDT, providing stable, predictable yields without the volatility of other crypto assets.",
      delay: 400
    },
    {
      icon: Users,
      title: "Web2 to Web3 Made Easy",
      description: "Intuitive interface designed for traditional finance users transitioning to DeFi. No crypto expertise required.",
      delay: 500
    },
    {
      icon: Key,
      title: "Keyless Account System",
      description: "Revolutionary Aptos Connect integration lets you access DeFi using your existing Google, Apple, or social accounts.",
      delay: 600
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "$8.5M+", icon: TrendingUp },
    { label: "Active Users", value: "12,500+", icon: Users },
    { label: "Current APY", value: "12.45%", icon: Star },
    { label: "Security Audits", value: "3", icon: Lock }
  ];

  const helpDocs = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough from wallet connection to your first deposit",
      link: "#"
    },
    {
      title: "Cross-Chain Bridging",
      description: "Understanding how we move your assets seamlessly between Ethereum and Aptos",
      link: "#"
    },
    {
      title: "Yield Strategies",
      description: "Learn how our automated strategies maximize your returns safely",
      link: "#"
    },
    {
      title: "Security & Audits",
      description: "Transparency reports and security measures protecting your funds",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Yield Optimizer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost">
                <BookOpen className="w-4 h-4 mr-2" />
                Help Docs
              </Button>
              <Button variant="hero" onClick={() => setIsWalletModalOpen(true)}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden parallax-bg">
        <div 
          className="absolute inset-0 bg-gradient-hero opacity-50"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 fade-in-scroll ${heroVisible ? 'visible' : ''}`} ref={heroRef}>
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  🚀 Now Live on Aptos
                </Badge>
                <h1 
                  className={`text-5xl lg:text-6xl font-bold leading-tight scroll-title transition-all duration-300 ${
                    scrollY > 100 ? 'scrolled' : ''
                  }`}
                  style={{
                    transform: `translateY(${scrollY * 0.2}px)`,
                    fontSize: scrollY > 200 ? '3rem' : ''
                  }}
                >
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Maximize
                  </span>
                  <br />
                  Your Yield
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  The smartest way to earn passive income from your stablecoins. 
                  Automated yield optimization with institutional-grade security.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="animate-glow-pulse"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Start Earning Now
                </Button>
                <Button variant="outline" size="xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="w-5 h-5 text-primary mr-2" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="DeFi Yield Optimization Platform" 
                className="relative rounded-3xl shadow-elevated w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 fade-in-scroll ${featuresVisible ? 'visible' : ''}`} ref={featuresRef}>
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">Yield Optimizer</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for the future of finance, designed for today's users. Experience the perfect blend of cutting-edge technology and user-friendly design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Help Documentation */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
              Help Documentation
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know to get started and maximize your returns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {helpDocs.map((doc, index) => (
              <Card 
                key={doc.title} 
                className="bg-card/50 backdrop-blur-sm border-border hover:border-primary hover:shadow-card transition-all group cursor-pointer animate-slide-up"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center group-hover:text-primary transition-colors">
                    {doc.title}
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{doc.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero border-t border-border">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users already earning passive income with Yield Optimizer. 
            Get started in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => setIsWalletModalOpen(true)}
              className="animate-glow-pulse"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet & Start
            </Button>
            <Button variant="outline" size="xl">
              <Globe className="w-5 h-5 mr-2" />
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Yield Optimizer
              </span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2024 Yield Optimizer. Building the future of DeFi yield farming.
            </p>
          </div>
        </div>
      </footer>

      <WalletModal open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen} />
    </div>
  );
};

export default Index;