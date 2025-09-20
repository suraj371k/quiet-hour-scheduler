import { sendEmail } from "@/lib/sendEmail";
import { connectToDatabase } from "./db";
import TimeBlock from "../../models/TimeBlock";

export async function main() {
  await connectToDatabase();

  const now = new Date();
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

  // Find blocks starting in 10 minutes and not yet notified
  const blocks = await TimeBlock.find({
    startTime: { $gte: now, $lte: tenMinutesLater },
    notified: false,
  }).populate("userId");

  for (const block of blocks) {
    const user = block.userId as any;
    if (!user?.email) continue;

    const subject = `Your study block "${block.title}" starts in 10 minutes`;
    const text = `Hi ${user.fullName || ""},\n\nYour study block "${block.title}" starts at ${block.startTime.toLocaleString()}.\n\nStay focused!`;

    try {
      await sendEmail(user.email, subject, text);
      block.notified = true;
      await block.save();
      console.log(`Notification sent to ${user.email}`);
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  }
}

main().catch(console.error);
