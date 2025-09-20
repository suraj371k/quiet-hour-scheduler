"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "@/lib/supabase";

type TimeBlockFormInputs = {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
};

export default function CreateTimeBlockForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimeBlockFormInputs>();

  const onSubmit: SubmitHandler<TimeBlockFormInputs> = async (data) => {
    try {
      // Get current Supabase session token
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("User not logged in");

      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to create time block");

      alert("Time block created successfully!");
      reset(); // clear the form
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto mt-10"
    >
      <div>
        <label className="block font-medium">Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="input"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea {...register("description")} className="input" />
      </div>

      <div>
        <label className="block font-medium">Start Time</label>
        <input
          {...register("startTime", { required: "Start time is required" })}
          type="datetime-local"
          className="input"
        />
        {errors.startTime && (
          <p className="text-red-500">{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">End Time</label>
        <input
          {...register("endTime", { required: "End time is required" })}
          type="datetime-local"
          className="input"
        />
        {errors.endTime && (
          <p className="text-red-500">{errors.endTime.message}</p>
        )}
      </div>

      <button type="submit" className="btn w-full">
        Create Time Block
      </button>
    </form>
  );
}
