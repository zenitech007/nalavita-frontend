import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role if available)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST be server-only
);

export async function GET(req: NextRequest) {
    try {
        // ----------------------------------------
        // 1. AUTH: Get user from Supabase JWT
        // ----------------------------------------
        const authHeader = req.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // ----------------------------------------
        // 2. FETCH PATIENT PROFILE
        // ----------------------------------------
        const patient = await prisma.patient.findUnique({
            where: {
                userId: user.id, // matches Supabase UUID
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialty: true,
                        clinicName: true,
                    },
                },
                organization: true,

                medications: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                },

                labResults: {
                    orderBy: { date: 'desc' },
                    include: {
                        markers: true,
                    },
                },

                appointments: {
                    orderBy: { date: 'asc' },
                    take: 5,
                },

                dailyLogs: {
                    orderBy: { date: 'desc' },
                    take: 7, // last 7 days
                },
            },
        });

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient profile not found' },
                { status: 404 }
            );
        }

        // ----------------------------------------
        // 3. FETCH AI MEMORY (IMPORTANT)
        // ----------------------------------------
        const memories = await prisma.medicalMemory.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { patientId: patient.id },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // ----------------------------------------
        // 4. SHAPE RESPONSE (AI + UI READY)
        // ----------------------------------------
        const response = {
            profile: {
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                gender: patient.gender,
                dateOfBirth: patient.dateOfBirth,
                language: patient.language,

                heightCm: patient.heightCm,
                weightKg: patient.weightKg,
                bloodType: patient.bloodType,
                genotype: patient.genotype,
                isPregnant: patient.isPregnant,

                allergies: patient.allergies,
                conditions: patient.conditions,
            },

            careTeam: patient.doctor
                ? {
                    doctor: patient.doctor,
                    organization: patient.organization,
                }
                : null,

            medications: patient.medications,
            labResults: patient.labResults,
            appointments: patient.appointments,
            dailyLogs: patient.dailyLogs,

            aiContext: {
                memories,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('[PATIENT_ME_ERROR]', error);

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}