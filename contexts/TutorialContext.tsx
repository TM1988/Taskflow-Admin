"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  page: string; // The page path where this step should show
  action?: () => void; // Optional action to perform when reaching this step
  minRole?: "viewer" | "member" | "admin" | "owner"; // Minimum role required to see this step
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  skipTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  completeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [allSteps, setAllSteps] = useState<TutorialStep[]>([]);

  // Determine user role
  const getUserRole = (): "viewer" | "member" | "admin" | "owner" => {
    if (!organization || !user) return "viewer";
    if (organization.ownerId === user.uid) return "owner";
    
    const member = organization.members?.find((m: any) => m.userId === user.uid);
    if (!member) return "viewer";
    
    const role = member.role?.toLowerCase() || "member";
    if (role.includes("admin")) return "admin";
    if (role.includes("member")) return "member";
    return "viewer";
  };

  // Define all tutorial steps
  const defineSteps = (): TutorialStep[] => {
    const role = getUserRole();
    const orgSlug = organization?.slug || "org";

    const baseSteps: TutorialStep[] = [
      {
        id: "welcome",
        title: "Welcome to Taskflow Admin! 🎉",
        description: `You've successfully ${role === "owner" ? "created" : "joined"} the organization. Let's take a quick tour to show you around!`,
        page: `/${orgSlug}`,
        position: "center",
      },
      {
        id: "dashboard",
        title: "Your Organization Dashboard",
        description: "This is your main dashboard. Here you can see an overview of your collections, stats, and quick access to key features.",
        targetSelector: ".dashboard-stats",
        page: `/${orgSlug}`,
        position: "bottom",
      },
      {
        id: "collections",
        title: "Collections Overview",
        description: "Collections are where your data lives. Each collection represents a MongoDB collection with its document count and size.",
        targetSelector: ".collections-section",
        page: `/${orgSlug}`,
        position: "top",
      },
    ];

    // Admin and owner get additional steps
    if (role === "admin" || role === "owner") {
      baseSteps.push({
        id: "create-collection",
        title: "Create Collections",
        description: "As an admin, you can create new collections and manage your data structure. Click here whenever you need to add a new collection.",
        targetSelector: "[data-tutorial='create-collection']",
        page: `/${orgSlug}`,
        position: "bottom",
      });
    }

    // Demo dashboard (all roles)
    baseSteps.push({
      id: "demo-intro",
      title: "Dashboard Demo",
      description: "Let's check out the demo page to see what you can build. I'll take you there now.",
      page: `/${orgSlug}`,
      position: "center",
      action: () => {
        setTimeout(() => router.push(`/${orgSlug}/demo`), 500);
      },
    });

    baseSteps.push({
      id: "demo-page",
      title: "Your Dashboard Preview",
      description: "This is a preview of the dashboard you can integrate into your app. It shows sample data with KPIs, charts, and tables.",
      page: `/${orgSlug}/demo`,
      position: "center",
    });

    baseSteps.push({
      id: "integration",
      title: "Integration Code",
      description: "Click 'Integration Code' to get the embed code for your app. You can copy and paste it anywhere you want to display this dashboard.",
      targetSelector: "[data-tutorial='integration-code']",
      page: `/${orgSlug}/demo`,
      position: "bottom",
    });

    // Owner-specific steps
    if (role === "owner") {
      baseSteps.push({
        id: "settings-intro",
        title: "Organization Settings",
        description: "As the owner, you have full control. Let's check out the settings.",
        page: `/${orgSlug}/demo`,
        position: "center",
        action: () => {
          setTimeout(() => router.push("/organizations/settings"), 500);
        },
      });

      baseSteps.push({
        id: "settings-page",
        title: "Manage Your Organization",
        description: "Here you can update organization details, manage members, generate invite codes, and configure advanced settings.",
        page: "/organizations/settings",
        position: "center",
      });

      baseSteps.push({
        id: "invite-members",
        title: "Invite Team Members",
        description: "Use the Invite tab to share your organization's invite code with team members. You can also regenerate the code if needed.",
        targetSelector: "[data-value='invite']",
        page: "/organizations/settings",
        position: "bottom",
      });
    }

    // Final step - back to dashboard
    baseSteps.push({
      id: "complete",
      title: "You're All Set! 🚀",
      description: `That's it! You now know the basics of Taskflow Admin. ${
        role === "owner" 
          ? "Start creating collections and building your dashboard!" 
          : role === "admin"
          ? "Start managing your data and collaborating with your team!"
          : "Explore the dashboard and see what your team has built!"
      }`,
      page: `/${orgSlug}`,
      position: "center",
      action: () => {
        setTimeout(() => router.push(`/${orgSlug}`), 500);
      },
    });

    return baseSteps;
  };

  const startTutorial = () => {
    const steps = defineSteps();
    setAllSteps(steps);
    setCurrentStep(0);
    setIsActive(true);
    
    // Navigate to first step's page
    if (steps[0]?.page) {
      router.push(steps[0].page);
    }
    
    localStorage.setItem("tutorialActive", "true");
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("tutorialCompleted", "true");
    localStorage.removeItem("tutorialActive");
  };

  const nextStep = () => {
    const next = currentStep + 1;
    if (next >= allSteps.length) {
      completeTutorial();
      return;
    }

    setCurrentStep(next);
    const step = allSteps[next];
    
    // Execute action if any
    if (step.action) {
      step.action();
    }
    
    // Navigate to step's page if different from current
    if (step.page && pathname !== step.page) {
      router.push(step.page);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const step = allSteps[prev];
      
      // Navigate to step's page if different from current
      if (step.page && pathname !== step.page) {
        router.push(step.page);
      }
    }
  };

  const completeTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("tutorialCompleted", "true");
    localStorage.removeItem("tutorialActive");
    
    // Navigate back to dashboard
    if (organization) {
      router.push(`/${organization.slug}`);
    }
  };

  // Check if tutorial should start automatically
  useEffect(() => {
    if (user && organization) {
      const hasCompleted = localStorage.getItem("tutorialCompleted");
      const wasActive = localStorage.getItem("tutorialActive");
      
      if (wasActive === "true" && !hasCompleted) {
        // Resume tutorial
        startTutorial();
      }
    }
  }, [user, organization]);

  // Get current step filtered by page
  const getCurrentStepForPage = (): TutorialStep | null => {
    if (!isActive || allSteps.length === 0) return null;
    const step = allSteps[currentStep];
    return step?.page === pathname ? step : null;
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps: allSteps,
        startTutorial,
        skipTutorial,
        nextStep,
        previousStep,
        completeTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
};
