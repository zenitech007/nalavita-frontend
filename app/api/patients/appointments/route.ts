import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabaseClient';

// FETCH APPOINTMENTS
export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

        // Fetch all appointments ordered by date
        const appointments = await prisma.appointment.findMany({
            where: { patientId: patient.id },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(appointments, { status: 200 });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// BOOK NEW APPOINTMENT
export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { date, time, type, location, notes, doctorName } = body;

        const patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

        const newAppointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                date: new Date(date),
                time,
                type,
                location,
                notes,
                doctorName,
                status: "Scheduled"
            }
        });

        return NextResponse.json(newAppointment, { status: 201 });
    } catch (error) {
        console.error("Error booking appointment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}