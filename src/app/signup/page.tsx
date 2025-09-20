"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    // 1. Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Supabase user ID not returned");
      return;
    }

    // 2. Save user to MongoDB via API
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supabaseUserId: userId,
        email,
        fullName,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to save user");
      return;
    }

    alert("Signup successful!");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="input"
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      <button onClick={handleSignup} className="btn">
        Sign Up
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
