"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Calendar, Filter, Loader, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

interface TimeBlockType {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "ongoing" | "previous";
}

const TimeBlocksApp = () => {
  const [blocks, setBlocks] = useState<TimeBlockType[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "previous">("all");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  // Get Supabase session token
  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchBlocks = async (filterType = filter) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("User not authenticated");

      const res = await fetch(`/api/blocks/get?filter=${filterType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch error:", text);
        setLoading(false);
        toast.error("Failed to fetch time blocks");
        return;
      }

      const data = await res.json();
      setBlocks(data.blocks || []);
      toast.success(`Loaded ${data.blocks?.length || 0} time blocks`);
    } catch (err) {
      console.error("Failed to fetch blocks:", err);
      toast.error("Failed to fetch time blocks");
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchBlocks();
  }, [filter]);

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "ongoing":
        return "default";
      case "previous":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "text-blue-500";
      case "ongoing":
        return "text-green-500";
      case "previous":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "ongoing", label: "Ongoing" },
    { key: "previous", label: "Previous" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Time Blocks</h1>
              <p className="text-sm text-gray-500">Manage your focused work sessions</p>
            </div>
          </div>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Create New Time Block</CardTitle>
                  <CardDescription>
                    Schedule a focused work session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Block title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="focus-visible:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Description (optional)"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="datetime-local"
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  
              
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter by status</span>
            </div>
            <Tabs 
              value={filter} 
              onValueChange={(value) => setFilter(value as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4">
                {filters.map(({ key, label }) => (
                  <TabsTrigger key={key} value={key}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Blocks List */}
        {!loading && (
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks found</h3>
                  <p className="text-gray-500">
                    {filter === "all" 
                      ? "Get started by creating your first time block!" 
                      : `No ${filter} time blocks found.`}
                  </p>
                  {filter !== "all" && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilter("all")}
                    >
                      View all blocks
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              blocks.map((block) => (
                <motion.div
                  key={block._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(block.status)}`} />
                            <h3 className="font-semibold text-lg">{block.title}</h3>
                          </div>
                          
                          {block.description && (
                            <p className="text-gray-600 mb-3">{block.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(block.startTime)}</span>
                            <span className="text-gray-300">→</span>
                            <span>{formatTime(block.endTime)}</span>
                          </div>
                        </div>
                        
                        <Badge variant={getStatusVariant(block.status)} className="capitalize">
                          {block.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeBlocksApp;