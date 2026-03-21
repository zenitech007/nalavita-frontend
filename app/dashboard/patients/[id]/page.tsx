'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, User, HeartPulse, FileText, Bot, Loader2 } from 'lucide-react';

// You can import your Patient interface from usePatients, or define a quick one here
export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const res = await fetch(`/api/patients/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch patient data");

        const data = await res.json();
        setPatient(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPatientDetails();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#FC94AF]">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-medium text-gray-500">Loading Patient Chart...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl font-bold text-gray-700 dark:text-gray-300">Patient Record Not Found</p>
        <button onClick={() => router.back()} className="mt-4 text-[#FC94AF] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 min-h-screen text-gray-900 dark:text-gray-100">

      {/* --- SCREEN UI ONLY (Hidden on Print) --- */}
      <div className="print:hidden flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#FC94AF] transition-colors">
          <ArrowLeft size={18} /> Back to Directory
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl shadow-md hover:opacity-80 transition-opacity font-medium">
          <Printer size={18} /> Download Chart PDF
        </button>
      </div>

      {/* --- PRINTABLE A4 AREA --- */}
      <div className="bg-white dark:bg-[#1E1F22] rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">

        {/* PDF Letterhead */}
        <div className="bg-linear-to-r from-[#FC94AF]/20 to-purple-500/20 p-8 border-b border-gray-100 dark:border-gray-800 print:bg-white print:border-b-4 print:border-[#FC94AF]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white print:text-black">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500 mt-1 font-medium print:text-gray-600">
                Patient ID: {patient.id.slice(0, 8).toUpperCase()} • Registered: {new Date(patient.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right hidden print:block">
              <h2 className="text-xl font-bold text-[#FC94AF]">Amelia MedTech</h2>
              <p className="text-xs text-gray-500">Official Clinical Record</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Column: Demographics */}
          <div className="col-span-1 space-y-6">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[#FC94AF]">
                <User size={16} /> Demographics
              </h3>
              <div className="bg-gray-50 dark:bg-[#121315] rounded-xl p-4 space-y-3 print:bg-transparent print:p-0">
                <div><span className="text-xs text-gray-500 block">Age / Gender</span> <span className="font-semibold">{patient.age || 'N/A'} yrs • {patient.gender || 'N/A'}</span></div>
                <div><span className="text-xs text-gray-500 block">Blood Type / Genotype</span> <span className="font-semibold text-red-500">{patient.bloodType || 'Unknown'} / {patient.genotype || '--'}</span></div>
                <div><span className="text-xs text-gray-500 block">Contact</span> <span className="font-semibold">{patient.phone || 'No Phone on Record'}</span></div>
                <div><span className="text-xs text-gray-500 block">Emergency Contact</span> <span className="font-semibold">{patient.nokName || 'N/A'} ({patient.nokPhone || '--'})</span></div>
              </div>
            </section>

            <section className="print:block">
              <div className="bg-[#FC94AF]/10 border border-[#FC94AF]/20 rounded-xl p-5 relative overflow-hidden">
                <Bot className="absolute -right-4 -top-4 text-[#FC94AF] opacity-20" size={80} />
                <h3 className="text-sm font-bold text-[#FC94AF] mb-2 flex items-center gap-2"><Bot size={16} /> Status Routing</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 relative z-10 print:text-black">
                  Assigned to <strong>{patient.department || 'General'}</strong>. <br />
                  Triage: <span className="font-bold">{patient.triageLevel} Priority</span>.<br />
                  Current Status: <strong>{patient.status}</strong>.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Clinical Data */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[#FC94AF]">
                <HeartPulse size={16} /> Initial Vitals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1E1F22] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm print:border-gray-300">
                  <span className="text-xs text-gray-500 block mb-1">Blood Pressure</span>
                  <span className="text-xl font-bold">{patient.bp || '--'}</span>
                </div>
                <div className="bg-white dark:bg-[#1E1F22] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm print:border-gray-300">
                  <span className="text-xs text-gray-500 block mb-1">Heart Rate</span>
                  <span className="text-xl font-bold">{patient.hr || '--'} <span className="text-xs font-normal text-gray-400">bpm</span></span>
                </div>
                <div className="bg-white dark:bg-[#1E1F22] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm print:border-gray-300">
                  <span className="text-xs text-gray-500 block mb-1">Temperature</span>
                  <span className="text-xl font-bold">{patient.temp || '--'}°C</span>
                </div>
                <div className="bg-white dark:bg-[#1E1F22] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm print:border-gray-300">
                  <span className="text-xs text-gray-500 block mb-1">SpO2</span>
                  <span className="text-xl font-bold">{patient.o2Sat || '--'}%</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[#FC94AF]">
                <FileText size={16} /> Clinical Profile
              </h3>
              <div className="space-y-4">
                <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 print:border-gray-300">
                  <h4 className="text-sm text-gray-500">Known Allergies</h4>
                  <p className="font-medium text-base print:text-black">{patient.allergies || 'None reported'}</p>
                </div>
                <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 print:border-gray-300">
                  <h4 className="text-sm text-gray-500">Pre-existing Conditions / Notes</h4>
                  <p className="font-medium text-base print:text-black whitespace-pre-wrap">{patient.conditions || 'No conditions on file.'}</p>
                </div>
                <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 print:border-gray-300">
                  <h4 className="text-sm text-gray-500">Current Medications</h4>
                  <p className="font-medium text-base print:text-black">{patient.currentMeds || 'None on file.'}</p>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* AI Chat Link (Hidden on Print) */}
      <div className="print:hidden mt-8">
        <div onClick={() => router.push(`/dashboard/amelia-chat?patientId=${patient.id}`)} className="bg-white dark:bg-[#1E1F22] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center h-40 opacity-80 hover:opacity-100 hover:border-[#FC94AF]/50 hover:shadow-lg hover:shadow-[#FC94AF]/10 transition-all cursor-pointer group">
          <Bot size={36} className="text-[#FC94AF] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-lg">Chat with Amelia about {patient.firstName}</h3>
          <p className="text-sm text-gray-500">Analyze charts, predict risks, or draft prescriptions directly from this file.</p>
        </div>
      </div>

    </div>
  );
}