import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Destructure the incoming data for clarity and safety
        const {
            doctorId,
            firstName,
            lastName,
            dob,
            age,
            gender,
            maritalStatus,
            phone,
            email,
            address,
            nokName,
            nokPhone,
            nokAddress,
            department,
            triageLevel,
            status,
            bp,
            hr,
            temp,
            o2Sat,
            heightCm,
            weightKg,
            bloodType,
            genotype,
            allergies,
            conditions,
            currentMedication,
            isPregnant,
            pregnancyMonths,
            pregnancySex,
            pregnancyBabies
        } = body;

        // 2. Validate required fields (Basic validation)
        if (!doctorId || !firstName || !lastName || !dob) {
            return NextResponse.json(
                { error: "Missing required fields (doctorId, firstName, lastName, or dob)" },
                { status: 400 }
            );
        }

        // 3. Transform data types to match the Prisma Schema
        const parsedDob = new Date(dob); // Converts 'YYYY-MM-DD' string to ISO-8601 DateTime
        const parsedAge = age ? parseInt(age, 10) : null;

        // Vitals parsing
        const parsedHr = hr ? parseInt(hr, 10) : null;
        const parsedTemp = temp ? parseFloat(temp) : null;
        const parsedO2Sat = o2Sat ? parseInt(o2Sat, 10) : null;

        // Pregnancy parsing
        const parsedPregnancyMonths = pregnancyMonths ? parseInt(pregnancyMonths, 10) : null;
        const parsedPregnancyBabies = pregnancyBabies ? parseInt(pregnancyBabies, 10) : 1;

        // 4. Create the record in the database
        const newPatient = await prisma.patient.create({
            data: {
                // Link to Doctor
                doctor: { connect: { id: doctorId } },

                // Demographics
                firstName,
                lastName,
                dob: parsedDob,
                age: parsedAge,
                gender,
                maritalStatus,

                // Contact & Emergency
                phone,
                email,
                address,
                nokName,
                nokPhone,
                nokAddress,

                // Clinical Routing
                department,
                triageLevel,
                status,

                // Vitals
                bp,
                hr: parsedHr,
                temp: parsedTemp,
                o2Sat: parsedO2Sat,

                // Physical Profile
                heightCm,
                weightKg,

                // Medical Profile
                bloodType,
                genotype,
                allergies,
                conditions,
                currentMeds: currentMedication, // Mapping from frontend 'currentMedication' to schema 'currentMeds'

                // Pregnancy
                isPregnant,
                pregnancyMonths: parsedPregnancyMonths,
                pregnancySex,
                pregnancyBabies: parsedPregnancyBabies,
            }
        });

        // 5. Return success response
        return NextResponse.json({ message: "Patient registered successfully", patient: newPatient }, { status: 201 });

    } catch (error) {
        console.error("Error creating patient:", error);

        // Return a generic error to the client, but keep the detailed error in your server logs
        return NextResponse.json(
            { error: "Internal Server Error. Failed to register patient." },
            { status: 500 }
        );
    }
}