import { sendEmail } from "@/lib/sendEmail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, text } = await req.json();
    await sendEmail(to, subject, text);
    return NextResponse.json({ success: true, message: "Email sent!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
