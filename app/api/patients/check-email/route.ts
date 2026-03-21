import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
        }

        // Search the Patient database for this email
        const existingPatient = await prisma.patient.findFirst({
            where: {
                email: email
            },
            // Fetch the doctor's info so we can tell the patient who created their file
            include: {
                doctor: {
                    select: { email: true } // In a real app, you might have a 'hospitalName' field to select here
                }
            }
        });

        if (existingPatient) {
            return NextResponse.json({ found: true, patient: existingPatient }, { status: 200 });
        } else {
            return NextResponse.json({ found: false }, { status: 200 });
        }

    } catch (error) {
        console.error("Error checking patient email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}