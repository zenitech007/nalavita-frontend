import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, name, dosage, frequency, instructions } = body;

    if (!patientId || !name || !dosage || !frequency) {
      return NextResponse.json({ error: "Missing required medication fields" }, { status: 400 });
    }

    const medication = await prisma.medication.create({
      data: {
        patientId,
        name,
        dosage,
        frequency,
        instructions,
        isActive: true
      }
    });

    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    console.error("Error saving medication:", error);
    return NextResponse.json({ error: "Failed to save medication" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json([], { status: 400 });
    }

    const meds = await prisma.medication.findMany({
      where: { patientId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(meds, { status: 200 });
  } catch (error) {
    console.error("Error fetching meds:", error);
    return NextResponse.json({ error: "Failed to fetch meds" }, { status: 500 });
  }
}