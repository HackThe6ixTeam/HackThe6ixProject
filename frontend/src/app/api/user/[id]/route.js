// src/app/api/jobs/[id]/route.js

import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  const foundUser = await User.findOne({ _id: id });
  return NextResponse.json(foundUser, { status: 200 });
}
