'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export function useRealtimePatient() {
    const supabase = createClient();

    const [patient, setPatient] = useState<any>(null);
    const [medications, setMedications] = useState<any[]>([]);
    const [vitals, setVitals] = useState({ bp: '-- / --', hr: '--' });
    const [loading, setLoading] = useState(true);

    // 🔄 Initial Fetch
    const fetchPatient = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const res = await fetch('/api/patients/me', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();
        const data = result.data;

        setPatient(data);

        // meds
        setMedications(
            (data.medications || []).map((med: any) => ({
                id: med.id,
                name: med.name,
                dose: med.dosage,
                time: med.frequency,
                status: med.status === 'ACTIVE' ? 'pending' : 'taken',
            }))
        );

        // vitals
        if (data.dailyLogs?.length > 0) {
            const latest = data.dailyLogs[0];
            setVitals({
                bp: latest.bloodPressure || '-- / --',
                hr: latest.heartRate?.toString() || '--',
            });
        }

        setLoading(false);
    };

    // ⚡ Realtime Subscriptions
    useEffect(() => {
        fetchPatient();

        const channel = supabase
            .channel('patient-realtime')

            // 🧾 Daily Logs (Vitals)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'DailyLog' },
                (payload) => {
                    console.log('Vitals update:', payload);

                    const newLog = payload.new as any;

                    setVitals({
                        bp: newLog.bloodPressure || '-- / --',
                        hr: newLog.heartRate?.toString() || '--',
                    });
                }
            )

            // 💊 Medications
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Medication' },
                (payload) => {
                    console.log('Medication update:', payload);

                    fetchPatient(); // simplest sync strategy
                }
            )

            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        patient,
        medications,
        vitals,
        loading,
        setMedications, // for optimistic updates
    };
}