import Job from "@/lib/models/Job";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const jobs = await Job.find();

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}