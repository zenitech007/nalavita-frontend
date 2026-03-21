import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabaseClient';

// ==========================================
// 🔐 AUTH HELPER (Robust)
// ==========================================
async function getAuthUser(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn('Missing or malformed Authorization header');
            return null;
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient();

        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('Supabase auth error:', error.message);
            return null;
        }

        return data?.user ?? null;
    } catch (err) {
        console.error('Auth parsing error:', err);
        return null;
    }
}

// ==========================================
// 📥 GET: Fetch Dashboard Profile & Vitals
// ==========================================
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 🔍 Try fetch patient
        let patient = await prisma.patient.findUnique({
            where: { userId: user.id },
            include: {
                medications: true,
                dailyLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        // 🧠 AUTO-CREATE FLOW (safe + atomic-like)
        if (!patient) {
            console.log('No patient found. Creating new profile...');

            // Ensure user exists in DB
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    email: user.email ?? 'unknown@email.com',
                    role: 'PATIENT',
                },
            });

            // Create patient profile
            patient = await prisma.patient.create({
                data: {
                    userId: user.id,
                    firstName: user.email?.split('@')[0] || 'Patient',
                    lastName: '',
                },
                include: {
                    medications: true,
                    dailyLogs: true,
                },
            });
        }

        return NextResponse.json(
            { success: true, data: patient },
            { status: 200 }
        );

    } catch (error) {
        console.error('GET /patients/me error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal Server Error',
            },
            { status: 500 }
        );
    }
}

// ==========================================
// ✏️ PATCH: Update Patient Profile (SAFE)
// ==========================================
export async function PATCH(request: Request) {
    try {
        const user = await getAuthUser(request);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // 🛡️ Use UPSERT to avoid crashes
        const patient = await prisma.patient.upsert({
            where: { userId: user.id },
            update: {
                firstName: body.firstName,
                lastName: body.lastName,
                dateOfBirth: body.dateOfBirth,
                gender: body.gender,
                heightCm: body.heightCm,
                weightKg: body.weightKg,
                bloodType: body.bloodType,
                genotype: body.genotype,
                allergies: body.allergies,
                conditions: body.conditions,
                isPregnant: body.isPregnant,
            },
            create: {
                userId: user.id,
                firstName: body.firstName || 'Patient',
                lastName: body.lastName || '',
                dateOfBirth: body.dateOfBirth,
                gender: body.gender,
                heightCm: body.heightCm,
                weightKg: body.weightKg,
                bloodType: body.bloodType,
                genotype: body.genotype,
                allergies: body.allergies,
                conditions: body.conditions,
                isPregnant: body.isPregnant,
            },
        });

        return NextResponse.json(
            { success: true, data: patient },
            { status: 200 }
        );

    } catch (error) {
        console.error('PATCH /patients/me error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal Server Error',
            },
            { status: 500 }
        );
    }
}