"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreateCollectionDialogProps {
  onCollectionCreated?: () => void;
}

export function CreateCollectionDialog({ onCollectionCreated }: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user, organization } = useAuth();

  const handleCreate = async () => {
    if (!collectionName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a collection name",
        variant: "destructive"
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(collectionName)) {
      toast({
        title: "Invalid name",
        description: "Collection name must be alphanumeric with underscores only",
        variant: "destructive"
      });
      return;
    }

    if (!user || !organization) {
      toast({
        title: "Not authenticated",
        description: "Please log in and join an organization to create collections",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/user-collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organization.id
        },
        body: JSON.stringify({
          collectionName: collectionName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create collection');
      }

      toast({
        title: "Collection created",
        description: `Successfully created collection "${collectionName}"`
      });

      setCollectionName("");
      setOpen(false);
      
      if (onCollectionCreated) {
        onCollectionCreated();
      }
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new MongoDB collection for your organization's data. The collection will be shared with your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collectionName">Collection Name</Label>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <Input
                id="collectionName"
                placeholder="e.g., tasks, projects, notes"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use alphanumeric characters and underscores only
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !collectionName.trim()}>
            {isCreating ? "Creating..." : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
