"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const getTargetElement = () => {
    if (!step.targetSelector) return null;
    return document.querySelector(step.targetSelector);
  };

  const getHighlightStyle = () => {
    const element = getTargetElement();
    if (!element) return {};

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
      animation: "pulse 2s ease-in-out infinite",
    };
  };

  const getCardPosition = () => {
    const element = getTargetElement();
    if (!element) {
      // Center of screen if no target
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      };
    }

    const rect = element.getBoundingClientRect();
    const position = step.position || "bottom";

    const base: any = {
      position: "fixed" as const,
      zIndex: 10002,
    };

    switch (position) {
      case "top":
        return { ...base, bottom: `${window.innerHeight - rect.top + 20}px`, left: `${rect.left}px` };
      case "bottom":
        return { ...base, top: `${rect.bottom + 20}px`, left: `${rect.left}px` };
      case "left":
        return { ...base, right: `${window.innerWidth - rect.left + 20}px`, top: `${rect.top}px` };
      case "right":
        return { ...base, left: `${rect.right + 20}px`, top: `${rect.top}px` };
      default:
        return { ...base, top: `${rect.bottom + 20}px`, left: `${rect.left}px` };
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Highlight box */}
      {step.targetSelector && (
        <div style={getHighlightStyle()} />
      )}

      {/* Tutorial card */}
      <Card style={getCardPosition()} className="max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
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
              onClick={onSkip}
              className="h-8 w-8 p-0"
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
              onClick={handlePrevious}
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
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse {
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
