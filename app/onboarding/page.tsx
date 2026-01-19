"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/contexts/TutorialContext";
import { LoadingSpinner } from "@/components/ui/loading";

export default function OnboardingPage() {
  const { user, organization, loading: authLoading } = useAuth();
  const { startTutorial } = useTutorial();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && organization) {
      const hasCompleted = localStorage.getItem("tutorialCompleted");
      
      if (!hasCompleted) {
        // Start the tutorial
        startTutorial();
      } else {
        // Already completed, go to dashboard
        router.push(`/${organization.slug}`);
      }
    } else if (!authLoading && user && !organization) {
      // No organization yet, stay on this page to show options
      return;
    } else if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, organization, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show organization selection if no org
  if (!organization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to Taskflow Admin</h1>
          <p className="text-muted-foreground">Loading your organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner message="Starting tutorial..." />
    </div>
  );
}
