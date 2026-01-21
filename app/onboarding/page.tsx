"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/contexts/TutorialContext";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to Taskflow Admin! 🎉</h1>
            <p className="text-muted-foreground">
              Let's get you started by setting up your organization
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/organizations/create')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Create Organization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Start fresh by creating a new organization. You'll be the owner with full control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/organizations/join')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Join Organization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Have an invite code? Join an existing organization and collaborate with your team.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push('/organizations/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
            <Button variant="outline" onClick={() => router.push('/organizations/join')}>
              <Users className="h-4 w-4 mr-2" />
              Join Organization
            </Button>
          </div>
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
