import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    try {
        // 1. Authenticate the user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];

        const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get the patient ID
        const patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // 3. Parse the incoming data
        const body = await request.json();
        const { dateString, medsTaken, waterLiters, steps, notes } = body;

        if (!dateString) {
            return NextResponse.json({ error: "dateString (YYYY-MM-DD) is required" }, { status: 400 });
        }

        // 4. Upsert the Daily Log
        // If a log for today exists, it updates it. If not, it creates a new one.
        const dailyLog = await prisma.dailyLog.upsert({
            where: {
                patientId_dateString: {
                    patientId: patient.id,
                    dateString: dateString,
                }
            },
            update: {
                // Only update fields that were actually sent in the request
                ...(medsTaken !== undefined && { medsTaken }),
                ...(waterLiters !== undefined && { waterLiters }),
                ...(steps !== undefined && { steps }),
                ...(notes !== undefined && { notes: notes }),
            },
            create: {
                patientId: patient.id,
                dateString: dateString,
                medsTaken: medsTaken || false,
                waterLiters: waterLiters || 0,
                steps: steps || 0,
                notes: notes || "",
            }
        });

        return NextResponse.json(dailyLog);

    } catch (error) {
        console.error("POST /api/patients/me/logs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}