import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            id,
            email,
            role,
            firstName,
            lastName,
            clinicName,
        } = body;

        // -------------------------------
        // 1. VALIDATION
        // -------------------------------
        if (!id || !email || !role) {
            return NextResponse.json(
                { error: 'Missing required fields (id, email, role)' },
                { status: 400 }
            );
        }

        if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // -------------------------------
        // 2. UPSERT USER
        // -------------------------------
        const user = await prisma.user.upsert({
            where: { id },
            update: { email, role },
            create: {
                id,
                email,
                role,
            },
        });

        // -------------------------------
        // 3. CREATE PROFILE
        // -------------------------------
        if (role === 'DOCTOR') {
            await prisma.doctor.upsert({
                where: { userId: id },
                update: {
                    firstName: firstName || 'Doctor',
                    lastName: lastName || 'Unknown',
                    clinicName: clinicName || 'Nala Vita Central',
                },
                create: {
                    userId: id,
                    firstName: firstName || 'Doctor',
                    lastName: lastName || 'Unknown',
                    clinicName: clinicName || 'Nala Vita Central',
                },
            });
        }

        if (role === 'PATIENT') {
            await prisma.patient.upsert({
                where: { userId: id },
                update: {},
                create: {
                    userId: id,
                    firstName: email.split('@')[0],
                    // FIX: We removed the `allergies: []` and `conditions: []` arrays. 
                    // Prisma will automatically default these to `null` which perfectly matches your schema!
                },
            });
        }

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error: any) {
        console.error('[REGISTER_ERROR]', error);

        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}