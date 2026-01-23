"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableBlock, KPIBlock, ChartBlock, FormBlock } from "@/components/blocks";
import { PlusCircle, Save, Trash2, Edit, LayoutGrid, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService, BlockConfig as ServiceBlockConfig } from "@/services/dashboard/dashboard-service";
import { PageHeader } from "./PageHeader";

const ResponsiveGridLayout = WidthProvider(Responsive);

type BlockConfig = ServiceBlockConfig;

interface DashboardBuilderProps {
  dashboardId?: string;
  dashboardName?: string;
}

export function DashboardBuilder({ dashboardId, dashboardName = "My Dashboard" }: DashboardBuilderProps) {
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({ lg: [] });
  const [blocks, setBlocks] = useState<BlockConfig[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState<string | undefined>(dashboardId);
  const [currentDashboardName, setCurrentDashboardName] = useState(dashboardName);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, organization } = useAuth();
  const router = useRouter();

  // New block form state
  const [newBlock, setNewBlock] = useState({
    type: "table" as BlockConfig["type"],
    collection: "",
    title: "",
    field: "",
    aggregation: "count",
    chartType: "bar"
  });

  useEffect(() => {
    // Fetch available collections
    const fetchCollections = async () => {
      if (!user || !organization) return;
      
      try {
        const response = await fetch("/api/user-collections", {
          headers: {
            'x-org-id': organization.id
          }
        });
        if (response.ok) {
          const data = await response.json();
          const collectionNames = data.collections?.map((c: any) => c.name) || [];
          console.log("Fetched collections:", collectionNames);
          setCollections(collectionNames);
        }
      } catch (err) {
        console.error("Failed to fetch collections", err);
        toast({
          title: "Failed to load collections",
          description: "Could not fetch your collections",
          variant: "destructive"
        });
      }
    };
    fetchCollections();

    // Load saved dashboard if dashboardId provided
    if (dashboardId && user) {
      loadDashboard(dashboardId);
    }
  }, [dashboardId, user]);

  const loadDashboard = async (id: string) => {
    try {
      const dashboard = await dashboardService.loadDashboard(id);
      if (dashboard) {
        setLayouts(dashboard.layouts);
        setBlocks(dashboard.blocks);
        setCurrentDashboardId(dashboard.id);
        setCurrentDashboardName(dashboard.name);
        toast({
          title: "Dashboard loaded",
          description: `Loaded "${dashboard.name}" successfully`
        });
      } else {
        toast({
          title: "Dashboard not found",
          description: "The dashboard could not be found",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast({
        title: "Load failed",
        description: "Failed to load dashboard",
        variant: "destructive"
      });
    }
  };

  const saveDashboard = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save dashboards",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const dashboardId = await dashboardService.saveDashboard(user.uid, {
        id: currentDashboardId,
        name: currentDashboardName,
        layouts,
        blocks,
        isDefault: !currentDashboardId // First dashboard is default
      });
      
      setCurrentDashboardId(dashboardId);
      
      toast({
        title: "Dashboard saved",
        description: "Your dashboard layout has been saved successfully"
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        title: "Save failed",
        description: "Failed to save dashboard",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = () => {
    if (!newBlock.collection) {
      toast({
        title: "Missing collection",
        description: "Please select a collection",
        variant: "destructive"
      });
      return;
    }

    const blockId = `block-${Date.now()}`;
    const newBlockConfig: BlockConfig = {
      i: blockId,
      type: newBlock.type,
      collection: newBlock.collection,
      title: newBlock.title || undefined,
      field: newBlock.field || undefined,
      aggregation: newBlock.aggregation || undefined,
      chartType: newBlock.chartType || undefined
    };

    setBlocks([...blocks, newBlockConfig]);

    // Add to layout
    const newLayout: Layout = {
      i: blockId,
      x: (blocks.length * 2) % 12,
      y: Math.floor(blocks.length / 6) * 4,
      w: newBlock.type === "table" ? 12 : 4,
      h: newBlock.type === "table" ? 6 : 4,
      minW: 2,
      minH: 2
    };

    setLayouts({ lg: [...(layouts.lg || []), newLayout] });
    setShowAddDialog(false);
    
    // Reset form
    setNewBlock({
      type: "table",
      collection: "",
      title: "",
      field: "",
      aggregation: "count",
      chartType: "bar"
    });
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.i !== blockId));
    setLayouts({
      lg: layouts.lg?.filter(l => l.i !== blockId) || []
    });
  };

  const onLayoutChange = (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
  };

  const renderBlock = (block: BlockConfig) => {
    const commonProps = {
      collection: block.collection,
      title: block.title
    };

    switch (block.type) {
      case "table":
        return <TableBlock {...commonProps} />;
      case "kpi":
        return (
          <KPIBlock 
            {...commonProps} 
            field={block.field}
            aggregation={block.aggregation as any}
            showTrend={true}
          />
        );
      case "chart":
        return (
          <ChartBlock 
            {...commonProps} 
            field={block.field || "status"}
            chartType={block.chartType as any}
          />
        );
      case "form":
        return <FormBlock {...commonProps} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={currentDashboardName}
        description="Drag and drop blocks to build your custom dashboard"
        icon={<LayoutGrid className="h-6 w-6" />}
        showBackButton={true}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Preview" : "Edit"}
            </Button>
            <Button
              size="sm"
              onClick={saveDashboard}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Dashboard"}
            </Button>
          </>
        }
      />
      <div className="container mx-auto p-6">
        <div className="mb-6">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Block</DialogTitle>
                <DialogDescription>
                  Configure your new dashboard block
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Block Type</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold mb-2">Block Types:</p>
                          <ul className="space-y-1 text-sm">
                            <li><strong>Table:</strong> Display data in rows and columns</li>
                            <li><strong>KPI:</strong> Show a single metric (count, sum, avg)</li>
                            <li><strong>Chart:</strong> Visualize data with bar/line/pie charts</li>
                            <li><strong>Form:</strong> Add or edit collection documents</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    value={newBlock.type} 
                    onValueChange={(v) => setNewBlock({ ...newBlock, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">📊 Table - View data in rows</SelectItem>
                      <SelectItem value="kpi">📈 KPI - Single metric display</SelectItem>
                      <SelectItem value="chart">📉 Chart - Visual data graphs</SelectItem>
                      <SelectItem value="form">📝 Form - Add/edit documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Collection</Label>
                  <Select 
                    value={newBlock.collection} 
                    onValueChange={(v) => setNewBlock({ ...newBlock, collection: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={collections.length === 0 ? "No collections available" : "Select collection"} />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.length === 0 ? (
                        <SelectItem value="_none" disabled>No collections found</SelectItem>
                      ) : (
                        collections.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {collections.length === 0 && (
                    <p className="text-xs text-muted-foreground">Create a collection first to use blocks</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input 
                    value={newBlock.title}
                    onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                    placeholder="Custom title"
                  />
                </div>

                {(newBlock.type === "kpi" || newBlock.type === "chart") && (
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Input 
                      value={newBlock.field}
                      onChange={(e) => setNewBlock({ ...newBlock, field: e.target.value })}
                      placeholder="e.g., status, amount"
                    />
                  </div>
                )}

                {newBlock.type === "kpi" && (
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select 
                      value={newBlock.aggregation} 
                      onValueChange={(v) => setNewBlock({ ...newBlock, aggregation: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newBlock.type === "chart" && (
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select 
                      value={newBlock.chartType} 
                      onValueChange={(v) => setNewBlock({ ...newBlock, chartType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="pie">Pie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addBlock}>
                  Add Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Grid */}
        {blocks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <LayoutGrid className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No blocks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your dashboard by adding blocks
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Block
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={onLayoutChange}
        >
          {blocks.map(block => (
            <div key={block.i} className="relative">
              {renderBlock(block)}
              {isEditing && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => removeBlock(block.i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
      </div>
    </div>
  );
}
