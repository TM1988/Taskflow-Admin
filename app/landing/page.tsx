"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    router.push("/dashboard");
  };

  const handleWatchDemo = () => {
    router.push("/demo");
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
            <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
              <Database className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold text-base tracking-tight">Taskflow Admin</span>
          </div>
          
          {/* Center Section: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Features</button>
            <button onClick={() => scrollToSection('use-cases')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Use Cases</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">Pricing</button>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">About</button>
          </div>
          
          {/* Right Section: Theme Toggle & Dashboard Button */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <ThemeToggle />
            <Button 
              onClick={() => router.push("/dashboard")} 
              size="sm"
              className="bg-foreground hover:bg-foreground/90 text-background font-medium px-4 py-2 h-8 text-sm rounded-md transition-colors duration-200"
            >
              Get Started
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
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" onClick={handleWatchDemo} className="group transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            See Demo
          </Button>
        </div>
      </section>

      {/* Scrolling Features Section */}
      <section className="py-20 bg-muted/30 overflow-hidden relative">
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
      <section id="features" className="container mx-auto max-w-7xl space-y-12 py-20 px-6">
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
      <section id="use-cases" className="container mx-auto max-w-7xl py-20 px-6 bg-muted/30">
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
      <section id="pricing" className="container mx-auto max-w-7xl py-20 px-6">
        <div className="max-w-3xl space-y-4 mb-16 text-center mx-auto">
          <div className="animate-fade-in-up">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Simple Pricing
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              No hidden costs, no subscriptions, no limits. Taskflow Admin is completely free and open source.
            </p>
          </div>
        </div>
        
        <div className="max-w-lg animate-fade-in-up animation-delay-400 mx-auto">
          <Card className="relative group transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-foreground/30">
            <Badge className="absolute -top-3 left-6 bg-foreground text-background" variant="default">
              100% Free & Open Source
            </Badge>
            <CardHeader className="pt-8 text-center">
              <CardTitle className="text-3xl group-hover:text-foreground transition-colors duration-300">Free Forever</CardTitle>
              <div className="text-5xl font-bold">$0</div>
              <CardDescription className="text-lg">
                Everything you need for powerful admin panels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-4">
                {pricingPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center animate-fade-in-up" style={{animationDelay: `${(index + 6) * 50}ms`}}>
                    {feature.startsWith('❌') ? (
                      <span className="mr-3 h-5 w-5 text-red-600 flex-shrink-0">❌</span>
                    ) : (
                      <CheckCircle className="mr-3 h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    <span className="text-sm">{feature.replace('❌ ', '')}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full group transition-all duration-300 hover:scale-105 hover:shadow-lg bg-foreground hover:bg-foreground/90 text-background" onClick={handleGetStarted}>
                Start Building Your Admin Panel
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Why Free Section */}
        <div id="about" className="mt-16 max-w-3xl animate-fade-in-up animation-delay-600 mx-auto">
          <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-foreground/20">
            <CardHeader>
              <CardTitle className="text-2xl group-hover:text-foreground transition-colors duration-300">Why is Taskflow Admin Free?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We believe powerful admin tools should be accessible to everyone. 
                Taskflow Admin is open source because we want to empower developers worldwide to build 
                better applications without barriers. No subscriptions, no hidden fees, no limits - just powerful tools for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto max-w-7xl py-20 px-6 bg-muted/30">
        <div className="max-w-3xl space-y-4 mb-16 ml-16">
          <div className="animate-fade-in-up">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-4xl md:text-5xl">
              Trusted by Developers
            </h2>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              See what developers are saying about Taskflow Admin
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 ml-16">
          <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Taskflow Admin saved us months of development time. The MongoDB auto-discovery feature 
                is incredible - we had a full admin panel up and running in under an hour."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  J
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Jessica Liu</p>
                  <p className="text-sm text-muted-foreground">CTO, CloudScale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The RBAC system is incredibly powerful yet simple to configure. 
                We manage multiple tenants with different permission levels seamlessly."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Robert Kim</p>
                  <p className="text-sm text-muted-foreground">Lead Engineer, DataFlow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Being open source and self-hostable was crucial for our compliance requirements. 
                Taskflow Admin checked all the boxes while being completely free."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  E
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Emily Torres</p>
                  <p className="text-sm text-muted-foreground">DevOps Lead, SecureApp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-2xl ml-16">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Join Thousands of Developers</h3>
              <p className="text-muted-foreground mb-6">
                Start building your admin panel today and experience the power of Taskflow Admin.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="bg-foreground hover:bg-foreground/90 text-background">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
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
                <li><a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a></li>
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
