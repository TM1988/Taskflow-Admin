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
  navigateTo?: string; // Optional page to navigate to after this step
  action?: () => void; // Optional action to perform when reaching this step
  minRole?: "viewer" | "member" | "admin" | "owner"; // Minimum role required to see this step
  hideNextButton?: boolean; // Hide the Next button (for steps that wait for user action)
  waitForEvent?: string; // Event name to wait for before proceeding
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

    // Owner goes through settings first, then creates collection, then sees demo
    // Non-owners go straight to demo
    if (role === "owner") {
      baseSteps.push({
        id: "settings-intro",
        title: "Organization Settings",
        description: "As the owner, you have full control. Let's check out the settings in 10 seconds (or click Next to skip).",
        page: `/${orgSlug}`,
        position: "center",
        navigateTo: "/organizations/settings",
      });

      baseSteps.push({
        id: "settings-page",
        title: "Organization Settings",
        description: "Here you can manage your organization. Let's explore the different settings tabs.",
        page: "/organizations/settings",
        position: "center",
      });

      baseSteps.push({
        id: "general-tab",
        title: "General Settings",
        description: "In the General tab, you can change your organization name and URL slug. These are the core identifiers for your organization.",
        targetSelector: "[data-value='general']",
        page: "/organizations/settings",
        position: "bottom",
      });

      baseSteps.push({
        id: "members-tab",
        title: "Manage Members",
        description: "The Members tab shows all users in your organization. You can manage their roles and remove members if needed.",
        targetSelector: "[data-value='members']",
        page: "/organizations/settings",
        position: "bottom",
      });

      baseSteps.push({
        id: "invite-tab",
        title: "Invite Team Members",
        description: "Click on the Invite tab to see your organization's invite code. Share this code with team members so they can join.",
        targetSelector: "[data-value='invite']",
        page: "/organizations/settings",
        position: "bottom",
      });

      baseSteps.push({
        id: "danger-zone",
        title: "Danger Zone",
        description: "The Advanced tab contains critical actions like deleting your organization. Use these options carefully!",
        targetSelector: "[data-value='advanced']",
        page: "/organizations/settings",
        position: "bottom",
      });

      baseSteps.push({
        id: "back-to-dashboard",
        title: "Back to Dashboard",
        description: "Now let's go back to the dashboard to create your first collection. I'll take you there in 10 seconds.",
        page: "/organizations/settings",
        position: "center",
        navigateTo: `/${orgSlug}`,
      });

      baseSteps.push({
        id: "create-collection-button",
        title: "Create Your First Collection",
        description: "Click the 'New Collection' button in the Collections section below to open the dialog.",
        targetSelector: "[data-tutorial='create-collection']",
        page: `/${orgSlug}`,
        position: "left",
        hideNextButton: true,
        waitForEvent: "collection-dialog-opened",
      });

      baseSteps.push({
        id: "create-collection-form",
        title: "Fill Out Collection Details",
        description: "Enter a name for your collection (like 'tasks' or 'projects'), and click Create Collection to finish. I'll automatically continue once you create it!",
        targetSelector: "[data-tutorial='create-collection-dialog']",
        page: `/${orgSlug}`,
        position: "right",
        hideNextButton: true,
        waitForEvent: "collection-created",
      });

      baseSteps.push({
        id: "collection-success",
        title: "Collection Created Successfully! 🎉",
        description: "Great! Your collection has been created. let's move on in 5 seconds (or click Next to skip).",
        targetSelector: "[data-sonner-toast]",
        page: `/${orgSlug}`,
        position: "left",
      });

      baseSteps.push({
        id: "demo-intro-owner",
        title: "Let's See the Demo",
        description: "Now let's check out the demo dashboard to see what you can build with your collections. I'll take you there in 10 seconds (or click Next to skip).",
        page: `/${orgSlug}`,
        position: "center",
        navigateTo: `/${orgSlug}/demo`,
      });
    } else {
      // Non-owners go to demo after initial dashboard tour
      baseSteps.push({
        id: "demo-intro",
        title: "Dashboard Demo",
        description: "Let's check out the demo page to see what you can build. I'll take you there in 10 seconds (or click Next to skip).",
        page: `/${orgSlug}`,
        position: "center",
        navigateTo: `/${orgSlug}/demo`,
      });
    }

    // Demo steps for all roles
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
      page: `/${orgSlug}/demo`,
      position: "center",
    });

    return baseSteps;
  };

  const startTutorial = () => {
    const steps = defineSteps();
    setAllSteps(steps);
    
    // Restore step if resuming
    const savedStep = localStorage.getItem("tutorialStep");
    const stepIndex = savedStep ? parseInt(savedStep, 10) : 0;
    setCurrentStep(stepIndex);
    setIsActive(true);
    
    // Navigate to current step's page
    if (steps[stepIndex]?.page) {
      router.push(steps[stepIndex].page);
    }
    
    localStorage.setItem("tutorialActive", "true");
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("tutorialCompleted", "true");
    localStorage.removeItem("tutorialActive");
    localStorage.removeItem("tutorialStep");
  };

  const nextStep = () => {
    const currentStepData = allSteps[currentStep];
    const next = currentStep + 1;
    
    if (next >= allSteps.length) {
      completeTutorial();
      return;
    }

    setCurrentStep(next);
    const nextStepData = allSteps[next];
    
    // Save current step to persist across navigation
    localStorage.setItem("tutorialStep", next.toString());
    
    // If current step has navigateTo, navigate there
    if (currentStepData?.navigateTo) {
      router.push(currentStepData.navigateTo);
    }
    // Otherwise navigate to next step's page if different from current
    else if (nextStepData.page && pathname !== nextStepData.page) {
      router.push(nextStepData.page);
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
    localStorage.removeItem("tutorialStep");
    
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
      
      // Auto-start if never completed before
      if (!hasCompleted && !isActive) {
        startTutorial();
      } else if (wasActive === "true" && !hasCompleted && !isActive) {
        // Resume tutorial if it was active
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
