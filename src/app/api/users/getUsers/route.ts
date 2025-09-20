import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const body = await req.json();

  if (!body.supabaseUserId) {
    return NextResponse.json(
      { error: "Missing supabaseUserId" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ supabaseUserId: body.supabaseUserId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
