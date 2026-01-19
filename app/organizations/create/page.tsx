"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Check, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAppUrl } from "@/lib/app-url";

export default function CreateOrganizationPage() {
  const { user, refreshOrganization } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [name]);

  // Check slug availability
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const response = await fetch(`/api/organizations/slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setSlugAvailable(data.available);
        }
      } catch (error) {
        console.error('Failed to check slug:', error);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slug]);

  const handleCreate = async () => {
    if (!user || !name || !slug || !slugAvailable) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          slug,
          ownerId: user.uid,
          ownerEmail: user.email
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
      }

      const data = await response.json();

      toast({
        title: "Organization created!",
        description: `Welcome to ${name}`
      });

      // Refresh organization in context before redirecting
      await refreshOrganization();

      // Mark that tutorial should start
      localStorage.removeItem('tutorialCompleted');
      localStorage.setItem('tutorialActive', 'true');

      // Redirect to organization dashboard where tutorial will start
      router.push(`/${slug}`);
    } catch (error: any) {
      toast({
        title: "Failed to create organization",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Create Your Organization</CardTitle>
          <CardDescription>
            Set up your workspace and start managing your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              placeholder="Acme Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              The name of your company or team
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {getAppUrl().replace(/^https?:\/\//, '')}/
              </span>
              <div className="relative flex-1">
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  disabled={creating}
                  className={
                    slug && slugAvailable !== null
                      ? slugAvailable
                        ? 'border-green-500'
                        : 'border-destructive'
                      : ''
                  }
                />
                {checkingSlug && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!checkingSlug && slug && slugAvailable !== null && (
                  slugAvailable ? (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                  )
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and hyphens only
            </p>
            {slug && !slugAvailable && !checkingSlug && (
              <p className="text-xs text-destructive">
                This URL is already taken. Please choose another.
              </p>
            )}
          </div>

          {slug && slugAvailable && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Your organization will be accessible at:{' '}
                <span className="font-mono font-semibold">
                  {getAppUrl().replace(/^https?:\/\//, '')}/{slug}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCreate}
              disabled={!name || !slug || !slugAvailable || creating || checkingSlug}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-5 w-5" />
                  Create Organization
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/onboarding')}
              disabled={creating}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
