// src/app/api/jobs/[id]/route.js

import Job from "@/lib/models/Job";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  const foundJob = await Job.findOne({ _id: id });
  return NextResponse.json(foundJob, { status: 200 });
}
