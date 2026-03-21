import { useState, useEffect, useCallback } from 'react';

// Updated interface to match your expanded Prisma Schema
export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    age: number | null;
    gender: string | null;
    status: string;
    triageLevel: string;
    updatedAt: string;

    // --- New Fields ---
    email?: string | null;
    phone?: string | null;
    department?: string | null;
    nokName?: string | null;
    bloodType?: string | null;
    bp?: string | null;
    hr?: number | null;
    heightCm?: number | null;
    weightKg?: number | null;

    _count?: {
        medications: number;
        records: number;
    };
}

export function usePatients(doctorId: string | undefined) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        if (!doctorId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/patients?userId=${doctorId}`);
            if (!res.ok) throw new Error("Failed to fetch patients");

            const data = await res.json();
            setPatients(data);
        } catch (err: any) {
            console.error("usePatients Error:", err);
            setError(err.message || "An error occurred while fetching patients");
        } finally {
            setIsLoading(false);
        }
    }, [doctorId]);

    // Fetch automatically when the hook mounts or the doctorId changes
    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Helper to format the database timestamp into a clean "Last Visit" string
    const formatLastVisit = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return {
        patients,
        isLoading,
        error,
        refetch: fetchPatients,
        formatLastVisit
    };
}