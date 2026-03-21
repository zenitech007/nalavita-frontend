'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// Dummy data representing the last 7 days of clinic activity
const data = [
    { name: 'Mon', newPatients: 12, aiDiagnoses: 8 },
    { name: 'Tue', newPatients: 19, aiDiagnoses: 15 },
    { name: 'Wed', newPatients: 15, aiDiagnoses: 10 },
    { name: 'Thu', newPatients: 22, aiDiagnoses: 18 },
    { name: 'Fri', newPatients: 28, aiDiagnoses: 24 },
    { name: 'Sat', newPatients: 14, aiDiagnoses: 12 },
    { name: 'Sun', newPatients: 9, aiDiagnoses: 7 },
];

export default function PatientIntakeChart() {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20, // Pulls the Y-axis tighter to the edge
                        bottom: 0,
                    }}
                >
                    {/* Subtle grid lines */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />

                    {/* Custom Tooltip to match your dark/light theme */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 31, 34, 0.9)',
                            borderColor: '#374151',
                            borderRadius: '8px',
                            color: '#F3F4F6',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#E5E7EB' }}
                    />

                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />

                    {/* The Data Lines */}
                    <Line
                        type="monotone"
                        name="New Patients"
                        dataKey="newPatients"
                        stroke="#FC94AF"
                        strokeWidth={3}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        dot={{ r: 3, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        name="AI Diagnoses"
                        dataKey="aiDiagnoses"
                        stroke="#8B5CF6" // A nice clinical purple
                        strokeWidth={3}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        dot={{ r: 3, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}