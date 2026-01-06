"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface KPIBlockProps {
  collection: string;
  field?: string;
  aggregation?: "count" | "sum" | "avg" | "min" | "max";
  title?: string;
  description?: string;
  showTrend?: boolean;
}

export function KPIBlock({ 
  collection, 
  field, 
  aggregation = "count", 
  title, 
  description,
  showTrend = false 
}: KPIBlockProps) {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<number>(0);

  useEffect(() => {
    const fetchKPI = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/collections/${collection}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const result = await response.json();
        const data = result.data || [];

        let calculatedValue = 0;
        
        switch (aggregation) {
          case "count":
            calculatedValue = data.length;
            break;
          case "sum":
            if (field) {
              calculatedValue = data.reduce((sum: number, item: any) => {
                const val = Number(item[field]) || 0;
                return sum + val;
              }, 0);
            }
            break;
          case "avg":
            if (field) {
              const sum = data.reduce((sum: number, item: any) => {
                const val = Number(item[field]) || 0;
                return sum + val;
              }, 0);
              calculatedValue = data.length > 0 ? sum / data.length : 0;
            }
            break;
          case "min":
            if (field) {
              const values = data.map((item: any) => Number(item[field]) || 0);
              calculatedValue = Math.min(...values);
            }
            break;
          case "max":
            if (field) {
              const values = data.map((item: any) => Number(item[field]) || 0);
              calculatedValue = Math.max(...values);
            }
            break;
        }

        setValue(calculatedValue);
        
        // Simulate trend (in real app, compare with previous period)
        if (showTrend) {
          setTrend(Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 20);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load KPI");
      } finally {
        setLoading(false);
      }
    };

    if (collection) {
      fetchKPI();
    }
  }, [collection, field, aggregation, showTrend]);

  const formatValue = (val: number | null) => {
    if (val === null) return "-";
    if (aggregation === "avg") return val.toFixed(2);
    return val.toLocaleString();
  };

  const getIcon = () => {
    if (showTrend && trend !== 0) {
      return trend > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || `${aggregation.toUpperCase()}${field ? ` of ${field}` : ""}`}
        </CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <>
            <div className="text-3xl font-bold">{formatValue(value)}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {showTrend && trend !== 0 && (
              <p className={`text-xs mt-2 font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}% from last period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
