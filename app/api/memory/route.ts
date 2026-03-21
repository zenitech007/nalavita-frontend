import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, observation, type = "NOTE" } = body;

    if (!patientId || !observation) {
      return NextResponse.json({ error: "Missing patientId or observation" }, { status: 400 });
    }

    const memory = await prisma.medicalMemory.create({
      data: {
        patientId,
        observation,
        type,
      }
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Error saving medical memory:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!patientId) return NextResponse.json({ error: "Missing patientId" }, { status: 400 });

    const memories = await prisma.medicalMemory.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(memories, { status: 200 });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}