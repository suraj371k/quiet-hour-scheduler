import { connectToDatabase } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User";
import TimeBlock from "../../../../models/TimeBlock";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  // 1️⃣ Get JSON body
  const body = await req.json();
  const { title, description, startTime, endTime, token } = body;

  if (!token)
    return NextResponse.json({ error: "Missing auth token" }, { status: 401 });

  // 2️⃣ Verify Supabase token
  const {
    data: { user },
    error: supabaseError,
  } = await supabase.auth.getUser(token);
  if (supabaseError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 3️⃣ Find corresponding MongoDB user
  const mongoUser = await User.findOne({ supabaseUserId: user.id });
  if (!mongoUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 4️⃣ Validate required fields
  if (!title || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end)
    return NextResponse.json(
      { error: "Start time must be before end time" },
      { status: 400 }
    );

  // 5️⃣ Check for overlapping blocks
  const overlap = await TimeBlock.findOne({
    userId: mongoUser._id,
    $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
  });

  if (overlap)
    return NextResponse.json(
      { error: "This time block overlaps with an existing block" },
      { status: 400 }
    );

  // 6️⃣ Create the block
  const newBlock = await TimeBlock.create({
    userId: mongoUser._id,
    title,
    description,
    startTime: start,
    endTime: end,
  });

  return NextResponse.json(newBlock);
}
