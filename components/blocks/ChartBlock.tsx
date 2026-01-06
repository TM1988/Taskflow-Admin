"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3 } from "lucide-react";

interface ChartBlockProps {
  collection: string;
  field: string;
  chartType?: "bar" | "line" | "pie";
  title?: string;
}

export function ChartBlock({ 
  collection, 
  field, 
  chartType = "bar", 
  title 
}: ChartBlockProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/collections/${collection}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const result = await response.json();
        const items = result.data || [];

        // Aggregate data by field value
        const aggregated = items.reduce((acc: any, item: any) => {
          const key = item[field] || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(aggregated).map(([label, count]) => ({
          label,
          value: count
        }));

        setData(chartData.slice(0, 10)); // Limit to top 10
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chart");
      } finally {
        setLoading(false);
      }
    };

    if (collection && field) {
      fetchData();
    }
  }, [collection, field]);

  const maxValue = Math.max(...data.map(d => d.value as number), 1);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {title || `${field} Distribution`}
        </CardTitle>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No data available</div>
        ) : (
          <div className="space-y-3">
            {data.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[150px]">
                    {String(item.label)}
                  </span>
                  <span className="text-muted-foreground ml-2">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-500"
                    style={{ 
                      width: `${((item.value as number) / maxValue) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
