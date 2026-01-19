"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, organization, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        // Not logged in -> landing page
        router.replace("/landing");
      } else if (!organization) {
        // Logged in but no organization -> onboarding
        router.replace("/onboarding");
      } else {
        // Has organization -> org dashboard
        router.replace(`/${organization.slug}`);
      }
    }
  }, [user, organization, loading, router, mounted]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
