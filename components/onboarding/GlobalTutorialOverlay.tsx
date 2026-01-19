"use client";

import { useEffect, useState } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export function GlobalTutorialOverlay() {
  const { isActive, currentStep, steps, skipTutorial, nextStep, previousStep } = useTutorial();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  
  // Only show if we're on the correct page for this step
  if (step?.page !== pathname) return null;

  const getTargetElement = () => {
    if (!step.targetSelector) return null;
    return document.querySelector(step.targetSelector);
  };

  const getHighlightStyle = () => {
    const element = getTargetElement();
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      position: "fixed" as const,
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      border: "3px solid hsl(var(--primary))",
      borderRadius: "8px",
      pointerEvents: "none" as const,
      zIndex: 10001,
      boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2)",
      animation: "tutorialPulse 2s ease-in-out infinite",
    };
  };

  const getCardPosition = () => {
    if (step.position === "center" || !step.targetSelector) {
      // Center of screen
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const element = getTargetElement();
    if (!element) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const rect = element.getBoundingClientRect();
    const base: any = {
      position: "fixed" as const,
      zIndex: 10002,
    };

    switch (step.position) {
      case "top":
        return { 
          ...base, 
          bottom: `${window.innerHeight - rect.top + 20}px`, 
          left: `${Math.max(20, rect.left)}px`,
          maxWidth: "400px",
        };
      case "bottom":
        return { 
          ...base, 
          top: `${rect.bottom + 20}px`, 
          left: `${Math.max(20, rect.left)}px`,
          maxWidth: "400px",
        };
      case "left":
        return { 
          ...base, 
          right: `${window.innerWidth - rect.left + 20}px`, 
          top: `${rect.top}px`,
          maxWidth: "400px",
        };
      case "right":
        return { 
          ...base, 
          left: `${rect.right + 20}px`, 
          top: `${rect.top}px`,
          maxWidth: "400px",
        };
      default:
        return { 
          ...base, 
          top: `${rect.bottom + 20}px`, 
          left: `${Math.max(20, rect.left)}px`,
          maxWidth: "400px",
        };
    }
  };

  const highlightStyle = getHighlightStyle();

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
        style={{ animation: "tutorialFadeIn 0.3s ease-in-out" }}
      />

      {/* Highlight box around target element */}
      {highlightStyle && <div style={highlightStyle} />}

      {/* Tutorial card */}
      <Card style={getCardPosition()} className="shadow-2xl max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
              className="h-8 w-8 p-0 shrink-0"
              title="Skip tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {step.description}
          </CardDescription>
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-primary w-4"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button size="sm" onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes tutorialFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px hsl(var(--primary) / 0.1);
          }
        }
      `}</style>
    </>
  );
}
