"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

interface FormBlockProps {
  collection: string;
  fields?: { name: string; label: string; type: string }[];
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function FormBlock({ 
  collection, 
  fields = [], 
  title, 
  description,
  onSuccess 
}: FormBlockProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const defaultFields = fields.length > 0 ? fields : [
    { name: "name", label: "Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "value", label: "Value", type: "number" }
  ];

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/collections/${collection}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create document");
      }

      toast({
        title: "Success",
        description: "Document created successfully"
      });

      // Reset form
      setFormData({});
      
      // Call success callback
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          {title || `Add to ${collection}`}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {defaultFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required
              />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
