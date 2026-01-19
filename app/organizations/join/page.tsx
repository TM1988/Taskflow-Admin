"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAppUrl } from "@/lib/app-url";

export default function JoinOrganizationPage() {
  const { user, refreshOrganization } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [inviteCode, setInviteCode] = useState("");
  const [organization, setOrganization] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setValidating(true);
    setError("");
    setOrganization(null);

    try {
      const response = await fetch(`/api/organizations/invite?code=${inviteCode.trim()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid invite code');
      }

      const data = await response.json();
      setOrganization(data.organization);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setValidating(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !inviteCode || !organization) {
      return;
    }

    setJoining(true);
    try {
      const response = await fetch('/api/organizations/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: inviteCode.trim(),
          userId: user.uid,
          email: user.email
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join organization');
      }

      toast({
        title: "Joined organization!",
        description: `Welcome to ${organization.name}`
      });

      // Refresh organization in context before redirecting
      await refreshOrganization();

      // Mark that tutorial should start
      localStorage.removeItem('tutorialCompleted');
      localStorage.setItem('tutorialActive', 'true');

      // Redirect to organization dashboard where tutorial will start
      router.push(`/${organization.slug}`);
    } catch (error: any) {
      toast({
        title: "Failed to join organization",
        description: error.message,
        variant: "destructive"
      });
      setError(error.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Join Organization</CardTitle>
          <CardDescription>
            Enter the invite code provided by your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Invite Code</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                placeholder="XXXXXXXX"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError("");
                  setOrganization(null);
                }}
                disabled={validating || joining}
                className="font-mono uppercase"
                maxLength={8}
              />
              <Button
                onClick={handleValidateCode}
                disabled={!inviteCode.trim() || validating || joining}
              >
                {validating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Validate"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ask your team admin for an invite code
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {organization && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                You're joining <span className="font-semibold">{organization.name}</span>
                <br />
                <span className="text-xs text-muted-foreground">
                  URL: {getAppUrl().replace(/^https?:\/\//, '')}/{organization.slug}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleJoin}
              disabled={!organization || joining}
            >
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-5 w-5" />
                  Join Organization
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/onboarding')}
              disabled={joining}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
