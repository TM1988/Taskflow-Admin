"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ArrowLeft, Info, Sparkles, Plus, Save, Play, Pause, LayoutGrid, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { EditableBlockWrapper } from "@/components/blocks/EditableBlockWrapper";
import { TableBlock } from "@/components/blocks/TableBlock";
import { KPIBlock } from "@/components/blocks/KPIBlock";
import { ChartBlock } from "@/components/blocks/ChartBlock";
import { FormBlock } from "@/components/blocks/FormBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBlock {
  id: string;
  type: "table" | "kpi" | "chart" | "form";
  config: any;
}

export default function DemoPage() {
  const router = useRouter();
  const { user, organization } = useAuth();
  const { toast } = useToast();
  
  const [showInstructions, setShowInstructions] = useState(true);
  const [isEditMode, setIsEditMode] = useState(true);
  const [blocks, setBlocks] = useState<DashboardBlock[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [showAddBlockDialog, setShowAddBlockDialog] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testDataIndex, setTestDataIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardId, setDashboardId] = useState<string | null>(null);

  // New block form state
  const [newBlockType, setNewBlockType] = useState<"table" | "kpi" | "chart" | "form">("table");
  const [newBlockConfig, setNewBlockConfig] = useState({
    title: "",
    collection: "",
    chartType: "bar",
    field: "",
    aggregation: "count",
  });

  useEffect(() => {
    if (user && organization) {
      loadDashboard();
    }
  }, [user, organization]);

  // Test mode data simulation
  useEffect(() => {
    if (!testMode) return;

    const interval = setInterval(() => {
      setTestDataIndex((prev) => (prev + 1) % 10); // Cycle through 10 data points
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [testMode]);

  const loadDashboard = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      const response = await fetch('/api/dashboards', {
        headers: {
          'x-org-id': organization.id,
          'x-user-id': user!.uid
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Find demo dashboard or create default
        const demoDashboard = data.dashboards?.find((d: any) => d.name === 'Demo Dashboard');
        
        if (demoDashboard) {
          setDashboardId(demoDashboard.id);
          setBlocks(demoDashboard.blocks || []);
          setLayout(demoDashboard.layout || []);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = () => {
    const newBlock: DashboardBlock = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      config: { ...newBlockConfig }
    };

    setBlocks([...blocks, newBlock]);
    
    // Add to layout
    const newLayoutItem: Layout = {
      i: newBlock.id,
      x: (blocks.length * 2) % 12,
      y: Infinity, // Puts it at the bottom
      w: newBlockType === "kpi" ? 3 : 6,
      h: newBlockType === "kpi" ? 2 : 4,
    };
    
    setLayout([...layout, newLayoutItem]);
    
    setShowAddBlockDialog(false);
    setNewBlockConfig({
      title: "",
      collection: "",
      chartType: "bar",
      field: "",
      aggregation: "count",
    });

    toast({
      title: "Block Added",
      description: `${newBlockType.charAt(0).toUpperCase() + newBlockType.slice(1)} block added to dashboard`,
    });
  };

  const handleEditBlock = (blockId: string, newConfig: any) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, config: newConfig } : b));
    toast({
      title: "Block Updated",
      description: "Block configuration has been updated",
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    setLayout(layout.filter(l => l.i !== blockId));
    toast({
      title: "Block Deleted",
      description: "Block has been removed from dashboard",
    });
  };

  const handleSaveDashboard = async () => {
    if (!organization || !user) return;

    setSaving(true);
    try {
      const url = dashboardId 
        ? `/api/dashboards/${dashboardId}`
        : '/api/dashboards';
      
      const method = dashboardId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organization.id,
          'x-user-id': user.uid
        },
        body: JSON.stringify({
          name: 'Demo Dashboard',
          blocks,
          layout
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      const data = await response.json();
      if (!dashboardId && data.dashboardId) {
        setDashboardId(data.dashboardId);
      }

      toast({
        title: "Dashboard Saved",
        description: "Your dashboard layout and blocks have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderBlock = (block: DashboardBlock) => {
    const config = testMode ? {
      ...block.config,
      // Inject test data based on testDataIndex
      testData: generateTestData(block.type, testDataIndex)
    } : block.config;

    switch (block.type) {
      case "table":
        return <TableBlock collection={config.collection} title={config.title} />;
      case "kpi":
        return (
          <KPIBlock
            collection={config.collection}
            field={config.field}
            aggregation={config.aggregation}
            title={config.title}
          />
        );
      case "chart":
        return (
          <ChartBlock
            collection={config.collection}
            chartType={config.chartType}
            field={config.field || config.xField || "value"}
            title={config.title}
          />
        );
      case "form":
        return <FormBlock collection={config.collection} title={config.title} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  const generateTestData = (blockType: string, index: number) => {
    // Generate different data based on index for animation effect
    const multiplier = 1 + (index * 0.1);
    return {
      value: Math.floor(1000 * multiplier),
      trend: index % 2 === 0 ? 'up' : 'down'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading demo..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Interactive Demo Dashboard"
        description="Build your custom dashboard with drag & drop blocks"
        icon={<Sparkles className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={testMode ? "default" : "outline"}
              size="sm"
              onClick={() => setTestMode(!testMode)}
            >
              {testMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {testMode ? "Stop Test Mode" : "Test Mode"}
            </Button>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              {isEditMode ? "Exit Edit" : "Edit Layout"}
            </Button>
            <Button size="sm" onClick={handleSaveDashboard} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="container mx-auto p-6 space-y-6">
        {showInstructions && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Welcome to the Interactive Demo!</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Add Blocks:</strong> Click "Add Block" to insert tables, KPIs, charts, or forms</li>
                <li><strong>Edit Mode:</strong> Drag blocks to rearrange, resize by dragging corners, hover to edit/delete</li>
                <li><strong>Test Mode:</strong> Watch data change in real-time to simulate live dashboards</li>
                <li><strong>Save:</strong> Your layout is saved to your organization's database</li>
              </ul>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it!
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {testMode && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <Play className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              <strong>Test Mode Active:</strong> Data is updating every 2 seconds to simulate real-time changes
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <Dialog open={showAddBlockDialog} onOpenChange={setShowAddBlockDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Block</DialogTitle>
                <DialogDescription>
                  Choose a block type and configure it
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Block Type</Label>
                  <Select value={newBlockType} onValueChange={(value: any) => setNewBlockType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="kpi">KPI Card</SelectItem>
                      <SelectItem value="chart">Chart</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newBlockConfig.title}
                    onChange={(e) => setNewBlockConfig({ ...newBlockConfig, title: e.target.value })}
                    placeholder="Block title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Collection</Label>
                  <Input
                    value={newBlockConfig.collection}
                    onChange={(e) => setNewBlockConfig({ ...newBlockConfig, collection: e.target.value })}
                    placeholder="Collection name"
                  />
                </div>

                {newBlockType === "chart" && (
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select 
                      value={newBlockConfig.chartType} 
                      onValueChange={(value) => setNewBlockConfig({ ...newBlockConfig, chartType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newBlockType === "kpi" && (
                  <>
                    <div className="space-y-2">
                      <Label>Field</Label>
                      <Input
                        value={newBlockConfig.field}
                        onChange={(e) => setNewBlockConfig({ ...newBlockConfig, field: e.target.value })}
                        placeholder="Field to aggregate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Aggregation</Label>
                      <Select 
                        value={newBlockConfig.aggregation} 
                        onValueChange={(value) => setNewBlockConfig({ ...newBlockConfig, aggregation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="count">Count</SelectItem>
                          <SelectItem value="sum">Sum</SelectItem>
                          <SelectItem value="avg">Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddBlockDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBlock}>Add Block</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {blocks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Blocks Yet</CardTitle>
              <CardDescription>
                Click "Add Block" to start building your dashboard
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={(newLayout) => setLayout(newLayout)}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            compactType="vertical"
          >
            {blocks.map((block) => (
              <div key={block.id} className="bg-background">
                <EditableBlockWrapper
                  blockId={block.id}
                  blockType={block.type}
                  config={block.config}
                  onEdit={handleEditBlock}
                  onDelete={handleDeleteBlock}
                  isEditMode={isEditMode}
                >
                  {renderBlock(block)}
                </EditableBlockWrapper>
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
}
