"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import { 
  ArrowRight, 
  CheckCircle, 
  Database, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe, 
  Play,
  Layout,
  Lock,
  Activity,
  Workflow,
  FileSearch,
  Github
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, organization, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set initial scroll state and mounted state
    setMounted(true);
    setIsScrolled(window.scrollY > 50);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  const handleWatchDemo = () => {
    router.push("/onboarding");
  };

  const features = [
    {
      icon: <Layout className="h-8 w-8" />,
      title: "Drag-and-Drop Builder",
      description: "Build custom admin panels with an intuitive drag-and-drop interface. No coding required for basic layouts."
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "MongoDB Auto-Discovery",
      description: "Automatically discover and connect to MongoDB collections. Instant admin panel generation from your database schema."
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-Time Updates",
      description: "Live data synchronization across all connected clients. See changes instantly without refreshing the page."
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Role-Based Access Control",
      description: "Granular permission system with customizable roles. Control who can view, edit, or delete data with precision."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Data Visualization",
      description: "Beautiful charts and graphs for your data. Transform complex datasets into actionable insights instantly."
    },
    {
      icon: <FileSearch className="h-8 w-8" />,
      title: "Audit Logging",
      description: "Track every change with comprehensive audit trails. Know who did what, when, and why for complete accountability."
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "Workflow Automation",
      description: "Create custom workflows and triggers. Automate repetitive tasks and business processes effortlessly."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Self-Hosting Ready",
      description: "Deploy on your own infrastructure for complete data control. No vendor lock-in, total ownership of your data."
    }
  ];

  const useCases = [
    {
      title: "E-Commerce Management",
      description: "Manage products, orders, customers, and inventory with a powerful admin dashboard tailored to your store."
    },
    {
      title: "SaaS Application",
      description: "Admin panel for user management, subscription handling, analytics, and system configuration."
    },
    {
      title: "Content Management",
      description: "Manage blog posts, media assets, categories, and users with an intuitive interface."
    },
    {
      title: "IoT & Analytics",
      description: "Monitor device data, visualize metrics, and manage configurations for IoT deployments."
    },
    {
      title: "Internal Tools",
      description: "Build custom dashboards for operations, support teams, and internal processes."
    },
    {
      title: "Multi-Tenant Systems",
      description: "Manage multiple organizations with isolated data and customizable permissions per tenant."
    }
  ];

  const pricingPlan = {
    name: "Free Forever",
    price: "$0",
    description: "Everything you need for powerful admin panels",
    popular: true,
    cta: "Start Building Your Admin Panel",
    features: [
      "Unlimited MongoDB collections",
      "Drag-and-drop interface builder",
      "Real-time data synchronization",
      "Advanced RBAC with custom roles", 
      "Data visualization & charts",
      "Comprehensive audit logging",
      "Workflow automation engine",
      "Self-host on your infrastructure",
      "❌ Self-hosting requires your own server costs"
    ]
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - 2rem));
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scroll {
          animation: scroll-left 30s linear infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .animation-delay-800 {
          animation-delay: 800ms;
        }
      `}</style>
      <div className="min-h-screen bg-background relative">
      {/* Navigation Header */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        mounted && isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/40" : "bg-background/50 backdrop-blur-sm"
      }`}>
        <div className="container mx-auto max-w-7xl flex h-14 items-center justify-between px-6">
          {/* Left Section: Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="font-semibold text-base tracking-tight">Taskflow Admin</span>
          </div>
          
          {/* Center Section: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Features</button>
            <button onClick={() => scrollToSection('use-cases')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Use Cases</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Reviews</button>
          </div>
          
          {/* Right Section: Theme Toggle & Dashboard Button */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <ThemeToggle />
            <Button 
              onClick={() => router.push(user && organization ? `/${organization.slug}/dashboard` : "/auth/login")} 
              size="sm"
              className="bg-foreground hover:bg-foreground/90 text-background font-medium px-4 py-2 h-8 text-sm rounded-md transition-colors duration-200"
            >
              {user ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl flex min-h-screen flex-col justify-center space-y-8 py-20 px-6 relative z-10">
        <div className="animate-fade-in-up max-w-4xl ml-16">
          <Badge variant="secondary" className="mb-6">
            Free & Open Source Admin Panel
          </Badge>
        </div>
        
        <div className="animate-fade-in-up animation-delay-200 max-w-4xl ml-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              Universal Admin Panel
              <br />
              <span className="text-foreground">For Any Database</span>
            </h1>
          </div>
        </div>
        
        <div className="animate-fade-in-up animation-delay-400 max-w-3xl ml-16">
          <p className="text-xl text-muted-foreground sm:text-2xl leading-relaxed">
            Build powerful admin panels in minutes with MongoDB auto-discovery, 
            drag-and-drop builder, and advanced RBAC. Completely free and open source.
          </p>
        </div>
        
        <div className="animate-fade-in-up animation-delay-600 flex flex-col gap-4 sm:flex-row ml-16">
          <Button size="lg" onClick={handleGetStarted} className="group transition-all duration-300 hover:scale-105 hover:shadow-lg bg-foreground hover:bg-foreground/90 text-background">
            {user ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Scrolling Features Section */}
      <section className="py-20 overflow-hidden relative">
        <div className="container mx-auto max-w-7xl text-center mb-12 px-4">
          <h2 className="text-3xl font-bold mb-4">Powerful Admin Tools</h2>
          <p className="text-muted-foreground">Everything you need to manage your data effectively</p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set */}
            <div className="flex space-x-8 flex-shrink-0">
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Layout className="h-8 w-8 text-foreground" />
                <span className="font-medium">Drag-and-Drop Builder</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Database className="h-8 w-8 text-foreground" />
                <span className="font-medium">MongoDB Auto-Discovery</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Activity className="h-8 w-8 text-foreground" />
                <span className="font-medium">Real-Time Updates</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Lock className="h-8 w-8 text-foreground" />
                <span className="font-medium">Advanced RBAC</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <BarChart3 className="h-8 w-8 text-foreground" />
                <span className="font-medium">Data Visualization</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <FileSearch className="h-8 w-8 text-foreground" />
                <span className="font-medium">Audit Logging</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Workflow className="h-8 w-8 text-foreground" />
                <span className="font-medium">Workflow Automation</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Globe className="h-8 w-8 text-foreground" />
                <span className="font-medium">Self-Hosting</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Shield className="h-8 w-8 text-foreground" />
                <span className="font-medium">Open Source</span>
              </div>
            </div>
            
            {/* Second identical set for seamless loop */}
            <div className="flex space-x-8 flex-shrink-0 ml-8">
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Layout className="h-8 w-8 text-foreground" />
                <span className="font-medium">Drag-and-Drop Builder</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Database className="h-8 w-8 text-foreground" />
                <span className="font-medium">MongoDB Auto-Discovery</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Activity className="h-8 w-8 text-foreground" />
                <span className="font-medium">Real-Time Updates</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Lock className="h-8 w-8 text-foreground" />
                <span className="font-medium">Advanced RBAC</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <BarChart3 className="h-8 w-8 text-foreground" />
                <span className="font-medium">Data Visualization</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <FileSearch className="h-8 w-8 text-foreground" />
                <span className="font-medium">Audit Logging</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Workflow className="h-8 w-8 text-foreground" />
                <span className="font-medium">Workflow Automation</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Globe className="h-8 w-8 text-foreground" />
                <span className="font-medium">Self-Hosting</span>
              </div>
              <div className="flex items-center space-x-4 bg-background/80 backdrop-blur rounded-lg p-4 border whitespace-nowrap">
                <Shield className="h-8 w-8 text-foreground" />
                <span className="font-medium">Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto max-w-7xl space-y-12 py-20 px-6 border-t border-border/40">
        <div className="max-w-3xl space-y-4 ml-16">
          <div className="animate-fade-in-up">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Features
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to build and manage powerful admin panels for any application.
            </p>
          </div>
        </div>
        <div className="grid justify-start gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ml-16">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in-up" style={{animationDelay: `${(index + 3) * 100}ms`}}>
              <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-foreground/20 h-full">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-foreground/10 group-hover:scale-110">
                    <div className="transition-transform duration-300 group-hover:rotate-12">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-foreground transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="container mx-auto max-w-7xl py-20 px-6 border-t border-border/40">
        <div className="max-w-3xl space-y-4 mb-16 ml-16">
          <div className="animate-fade-in-up">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Built For Every Use Case
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              From e-commerce to IoT, Taskflow Admin adapts to your specific needs
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ml-16">
          {useCases.map((useCase, index) => (
            <Card key={index} className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-foreground/20">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-foreground transition-colors duration-300">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto max-w-7xl py-20 px-6 border-t border-border/40">
        <div className="max-w-2xl space-y-3 mb-12 text-center mx-auto">
          <div className="animate-fade-in-up">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Pricing
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="leading-normal text-muted-foreground sm:text-lg">
              Free and open source, forever.
            </p>
          </div>
        </div>
        
        <div className="max-w-md animate-fade-in-up animation-delay-400 mx-auto">
          <Card className="relative group transition-all duration-300 hover:shadow-xl border-2">
            <Badge className="absolute -top-2 left-4 bg-foreground text-background text-xs" variant="default">
              Open Source
            </Badge>
            <CardHeader className="pt-6 pb-3 text-center">
              <CardTitle className="text-2xl">Free Forever</CardTitle>
              <div className="text-4xl font-bold">$0</div>
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              <ul className="space-y-2">
                {pricingPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    {feature.startsWith('❌') ? (
                      <span className="mr-2 h-4 w-4 text-red-600 flex-shrink-0">❌</span>
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    <span>{feature.replace('❌ ', '')}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-4 bg-foreground hover:bg-foreground/90 text-background" onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto max-w-7xl py-20 px-6 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in-up mb-6">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Reviews Coming Soon
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <Card className="p-12">
              <p className="text-xl text-muted-foreground leading-relaxed">
                We&apos;re just getting started! User reviews and testimonials will be added here as developers 
                start using Taskflow Admin. Be one of the first to try it out and share your experience.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="mt-8 bg-foreground hover:bg-foreground/90 text-background">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                  <Database className="h-4 w-4 text-background" />
                </div>
                <span className="font-bold text-lg">Taskflow Admin</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Universal admin panel for any database. Free and open source.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" onClick={() => window.open('https://github.com/tm1988/taskflow-admin', '_blank')}>
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href={user && organization ? `/${organization.slug}/dashboard` : "/auth/login"} className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a></li>
                <li><a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="/api" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="/tutorials" className="text-muted-foreground hover:text-foreground transition-colors">Tutorials</a></li>
                <li><a href="/examples" className="text-muted-foreground hover:text-foreground transition-colors">Examples</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Taskflow Admin. Open source and free forever. Built with ❤️ for developers.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-muted-foreground">Built with</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">Next.js</Badge>
                <Badge variant="outline" className="text-xs">React</Badge>
                <Badge variant="outline" className="text-xs">MongoDB</Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
