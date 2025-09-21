import { connectToDatabase } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User";
import TimeBlock from "../../../../../models/TimeBlock";

// GET all blocks for a user
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify Supabase token
    const { data: userData, error: supabaseError } = await supabase.auth.getUser(token);
    const user = userData?.user;

    if (supabaseError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find corresponding MongoDB user
    const mongoUser = await User.findOne({ supabaseUserId: user.id });
    if (!mongoUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get filter param
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    const now = new Date();
    let query: { [key: string]: any } = { userId: mongoUser._id };
    let blocks;

    switch (filter) {
      case "upcoming":
        query.startTime = { $gt: now };
        blocks = await TimeBlock.find(query).sort({ startTime: 1 });
        break;

      case "ongoing":
        query.startTime = { $lte: now };
        query.endTime = { $gt: now };
        blocks = await TimeBlock.find(query).sort({ startTime: 1 });
        break;

      case "previous":
        query.endTime = { $lt: now };
        blocks = await TimeBlock.find(query).sort({ endTime: -1 });
        break;

      case "all":
      default:
        blocks = await TimeBlock.find(query).sort({ startTime: 1 });
        break;
    }

    // Add status to each block
    const blocksWithStatus = blocks.map((block) => {
      let status: "upcoming" | "ongoing" | "previous";
      if (now < block.startTime) status = "upcoming";
      else if (now >= block.startTime && now <= block.endTime) status = "ongoing";
      else status = "previous";

      return { ...block.toObject(), status };
    });

    return NextResponse.json({
      blocks: blocksWithStatus,
      count: blocksWithStatus.length,
      filter,
    });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 });
  }
}
