"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  showBackButton = false,
  backHref,
  icon,
  actions 
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => backHref ? router.push(backHref) : router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {icon || <Database className="h-6 w-6" />}
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground hidden sm:block">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
