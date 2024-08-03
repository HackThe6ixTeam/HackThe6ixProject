import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body', body);
    const userData = body.userInfo;

    // Create the user and capture the result
    const newUser = await User.create(userData);

    // Access the ID of the newly created user
    const userId = newUser._id;

    return NextResponse.json({ message: "User Created", userId: userId }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Error", err }, { status: 500 });
  }
}