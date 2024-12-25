import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../_datalib/_prisma/client.js';

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, profilePic } =
      await req.json();

    // Validate the required fields
    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profilePic: profilePic || 0, // Default profile picture
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
