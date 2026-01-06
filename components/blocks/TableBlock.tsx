"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, RefreshCw } from "lucide-react";

interface TableBlockProps {
  collection: string;
  title?: string;
  pageSize?: number;
}

export function TableBlock({ collection, title, pageSize = 10 }: TableBlockProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/collections/${collection}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      
      const result = await response.json();
      setData(result.data || []);
      
      // Extract column names from first document
      if (result.data && result.data.length > 0) {
        const cols = Object.keys(result.data[0]).filter(key => key !== '_id');
        setColumns(['_id', ...cols]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collection) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, page, searchQuery]);

  const handleRefresh = () => {
    fetchData();
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value).slice(0, 50) + "...";
    if (typeof value === "boolean") return value ? "✓" : "✗";
    return String(value).slice(0, 100);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {title || collection}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No data found</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="font-semibold">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {renderCellValue(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={data.length < pageSize}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
