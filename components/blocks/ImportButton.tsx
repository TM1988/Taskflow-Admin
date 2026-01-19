"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ImportButtonProps {
  collection: string;
  onImportComplete?: () => void;
}

export function ImportButton({ collection, onImportComplete }: ImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, organization } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse file for preview
    try {
      const text = await selectedFile.text();
      let parsedData: any[] = [];

      if (selectedFile.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (selectedFile.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or JSON file",
          variant: "destructive"
        });
        return;
      }

      // Show first 5 rows as preview
      setPreview(parsedData.slice(0, 5));
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse file. Please check the format.",
        variant: "destructive"
      });
      setFile(null);
      setPreview([]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        // Try to parse as JSON if it looks like an object or array
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            row[header] = JSON.parse(value);
          } catch {
            row[header] = value;
          }
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return data;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const handleImport = async () => {
    if (!file || !user || !organization) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      let data: any[] = [];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Import data via API
      const response = await fetch(`/api/collections/${collection}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organization.id
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import data');
      }

      const result = await response.json();

      toast({
        title: "Import successful",
        description: `Imported ${result.insertedCount || data.length} documents`
      });

      setOpen(false);
      setFile(null);
      setPreview([]);
      onImportComplete?.();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to import data into {collection}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, JSON
            </p>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="border rounded-md p-4 bg-muted/50 max-h-[300px] overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Total rows in file: {preview.length > 0 ? "..." : "0"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
