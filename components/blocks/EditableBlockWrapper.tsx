"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface EditableBlockWrapperProps {
  blockId: string;
  blockType: string;
  config: any;
  onEdit: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  isEditMode: boolean;
  children: ReactNode;
}

export function EditableBlockWrapper({
  blockId,
  blockType,
  config,
  onEdit,
  onDelete,
  isEditMode,
  children,
}: EditableBlockWrapperProps) {
  return (
    <div className="relative h-full group">
      {children}
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(blockId)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(blockId)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
