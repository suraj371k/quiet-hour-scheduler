import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/sendEmail";
import { NextResponse } from "next/server";
import TimeBlock from "../../../../models/TimeBlock";
import { format } from "date-fns-tz";

export async function GET() {
  await connectToDatabase();

  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Find upcoming blocks in the next 10 minutes that haven't received a reminder
    const blocks = await TimeBlock.find({
      startTime: { $gte: now, $lte: tenMinutesFromNow },
      notified: { $ne: true }, // use the renamed field
    }).populate("userId");

    if (!blocks.length) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No upcoming blocks",
      });
    }

    // Send emails concurrently
    const results = await Promise.all(
      blocks.map(async (block) => {
        const user = block.userId;
        if (!user?.email) return null;

        const formattedTime = format(
          new Date(block.startTime),
          "yyyy-MM-dd HH:mm:ssXXX",
          { timeZone: "Asia/Kolkata" }
        );

        try {
          await sendEmail(
            user.email,
            "Reminder: Your block is coming up!",
            `Hi ${user.fullName || "User"},\n\nYour block "${
              block.title
            }" starts at ${formattedTime}.\n\nDon't miss it!`
          );

          block.notified = true; // ✅ use notified
          await block.save();
          return true;
        } catch (err) {
          console.error(`Failed to send email for block ${block._id}:`, err);
          return false;
        }
      })
    );

    const sentCount = results.filter(Boolean).length;

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err) {
    console.error("Error in sending reminders:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
