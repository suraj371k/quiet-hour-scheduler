"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, FileText, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

type TimeBlockFormInputs = {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
};

export default function CreateTimeBlockForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TimeBlockFormInputs>();

  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit: SubmitHandler<TimeBlockFormInputs> = async (data) => {
    try {
      // Get current Supabase session token
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("User not logged in");

      const res = await fetch("/api/blocks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to create time block");

      setIsSuccess(true);
      toast.success("Block created successfully")
      reset();
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">
              Create Time Block
            </CardTitle>
            <CardDescription className="text-center">
              Schedule your focused work sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Deep Work Session"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What will you focus on during this time?"
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register("startTime", { required: "Start time is required" })}
                    className={errors.startTime ? "border-destructive" : ""}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-destructive">{errors.startTime.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...register("endTime", { required: "End time is required" })}
                    className={errors.endTime ? "border-destructive" : ""}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Time Block"
                )}
              </Button>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-sm text-green-700 bg-green-100 rounded-md"
                >
                  Time block created successfully!
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}