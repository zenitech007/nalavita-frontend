import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Fetch the patient from PostgreSQL via Prisma
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient, { status: 200 });

  } catch (error) {
    console.error("Error fetching patient details:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching patient" },
      { status: 500 }
    );
  }
}