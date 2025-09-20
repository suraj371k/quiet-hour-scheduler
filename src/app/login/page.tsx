"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  const handleSignIn = async () => {
    setError("");

    // 1️⃣ Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return;
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      setError("No user returned from Supabase");
      return;
    }

    // 2️⃣ Optionally fetch MongoDB user data
    const res = await fetch("/api/users/getUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supabaseUserId: supabaseUser.id }),
    });

    if (!res.ok) {
      setError("Failed to fetch user from MongoDB");
      return;
    }

    const mongoUser = await res.json();
    setUser(mongoUser);
    console.log("Logged in user:", mongoUser);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
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
      <button onClick={handleSignIn} className="btn">
        Sign In
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {user && <p>Welcome, {user.fullName}!</p>}
    </div>
  );
}
