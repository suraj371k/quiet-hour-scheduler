import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User";


export async function POST(req: NextRequest) {
    await connectToDatabase()
    const body = await req.json()

  if (!body.supabaseUserId || !body.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

    // Avoid duplicate user
  let existingUser = await User.findOne({ supabaseUserId: body.supabaseUserId });
  if (existingUser) {
    return NextResponse.json(existingUser);
  }

  const user = await User.create({
    supabaseUserId: body.supabaseUserId,
    email: body.email,
    fullName: body.fullName,
    timeZone: body.timeZone,
  });

  return NextResponse.json(user);

}