import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        // 1. Verify the user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse the incoming data from the frontend
        const body = await request.json();
        const { scheduleId, medicationName, timeTaken } = body;

        if (!scheduleId || !timeTaken) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Find the Patient ID linked to this Auth User
        const patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
        }

        // 4. Log the action to the database
        // We use DailyLog so the doctor can see a timeline of when pills were taken
        const newLog = await prisma.dailyLog.create({
            data: {
                patientId: patient.id,
                title: "Medication Taken",
                type: "MEDICATION_ADHERENCE",
                notes: `Patient marked ${medicationName} as taken at ${timeTaken}.`,
                // You can add specific fields to your DailyLog model later if needed
            }
        });

        return NextResponse.json({ success: true, log: newLog }, { status: 200 });

    } catch (error) {
        console.error("Error syncing medication:", error);
        return NextResponse.json(
            { error: "Internal Server Error while syncing medication" },
            { status: 500 }
        );
    }
}