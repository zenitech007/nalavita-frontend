import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, email, role, firstName, lastName, clinicName } = body;

        // 1. Validate the incoming payload
        if (!id || !email || !role) {
            return NextResponse.json(
                { error: "Missing required fields (id, email, or role)" }, 
                { status: 400 }
            );
        }

        // 2. Create or Update the Core User Table
        // We use "upsert" so that if this API is accidentally called twice, it won't crash your app with a duplicate key error.
        const user = await prisma.user.upsert({
            where: { id },
            update: { email, role },
            create: { id, email, role },
        });

        // 3. Create the Specific Profile based on the Role
        if (role === 'DOCTOR') {
            await prisma.doctor.upsert({
                where: { userId: id },
                update: {
                    firstName: firstName || 'Dr.',
                    lastName: lastName || 'Unknown',
                    clinicName: clinicName || 'Nala Vita Central'
                },
                create: {
                    userId: id,
                    firstName: firstName || 'Dr.',
                    lastName: lastName || 'Unknown',
                    clinicName: clinicName || 'Nala Vita Central'
                }
            });
        } else if (role === 'PATIENT') {
            await prisma.patient.upsert({
                where: { userId: id },
                update: {}, // We leave this blank because Patients will fill out their details in the Onboarding flow
                create: {
                    userId: id,
                    firstName: email.split('@')[0], // Temporarily use their email handle as their first name
                    lastName: "",
                }
            });
        }

        // 4. Return success to the frontend
        return NextResponse.json({ success: true, user }, { status: 201 });

    } catch (error: any) {
        console.error("Registration Database Sync Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to sync user to the database." }, 
            { status: 500 }
        );
    }
}