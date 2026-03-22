'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, PhoneCall, FileText, ChevronRight, ChevronLeft,
  CheckCircle2, Activity, Baby, Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function PatientOnboarding() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', age: '', gender: 'Male', maritalStatus: 'Single',
    phone: '', address: '', nokName: '', nokPhone: '', nokAddress: '',
    height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg', bloodType: '', genotype: '',
    allergies: '', conditions: '', currentMeds: '',
    isPregnant: 'No', pregnancyMonths: '', pregnancySex: 'Unknown', pregnancyBabies: '1'
  });

  useEffect(() => {
    const initializeOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserEmail(session.user.email || '');

      // Auto-fill first name from the database (which we generated from their email)
      try {
        const res = await fetch('/api/patients/me', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          if (profile.firstName) {
            setFormData(prev => ({ ...prev, firstName: profile.firstName }));
          }
        }
      } catch (e) {
        console.error("Could not fetch base profile", e);
      }
    };

    initializeOnboarding();
  }, [router, supabase]);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    if (!newDob) return setFormData({ ...formData, dob: newDob, age: '' });
    const today = new Date();
    const birthDate = new Date(newDob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    setFormData({ ...formData, dob: newDob, age: age.toString() });
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- NEW: PERFECT PRISMA SYNC LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication lost.");

      // Convert measurements to match the Prisma Schema (Float expected)
      let heightCm = parseFloat(formData.height);
      if (formData.heightUnit === 'in') heightCm = heightCm * 2.54;

      let weightKg = parseFloat(formData.weight);
      if (formData.weightUnit === 'lb') weightKg = weightKg * 0.453592;

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob
          ? new Date(formData.dob).toISOString()
          : null,
        gender: formData.gender,

        heightCm: isNaN(heightCm) ? null : heightCm,
        weightKg: isNaN(weightKg) ? null : weightKg,

        bloodType: formData.bloodType || null,
        genotype: formData.genotype || null,

        // ✅ FIXED FOR PRISMA ARRAY
        allergies: formData.allergies
          ? formData.allergies.split(',').map(a => a.trim())
          : [],

        conditions: formData.conditions
          ? formData.conditions.split(',').map(c => c.trim())
          : [],

        isPregnant: formData.isPregnant === 'Yes',
      };

      const response = await fetch('/api/patients/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save profile.");

      // Wait a second for a smooth animation, then jump to the dashboard!
      setTimeout(() => router.push('/patient-portal'), 1500);

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Failed to save profile. Please try again.");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FC94AF] focus:ring-4 focus:ring-[#FC94AF]/10 transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider";

  const stepVariants = {
    hidden: { opacity: 0, x: 20, filter: "blur(2px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, filter: "blur(2px)", transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0A0B0D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#FC94AF] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 dark:opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-20 dark:opacity-10"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-2xl bg-white dark:bg-[#1E1F22] rounded-3xl shadow-2xl shadow-black/10 dark:shadow-[#FC94AF]/5 border border-gray-200 dark:border-white/5 relative z-10 overflow-hidden min-h-100 flex flex-col">
        <div className="flex flex-col h-full">

          {/* Header / Progress Bar */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14151A]/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#FC94AF]/10 rounded-xl text-[#FC94AF]"><Sparkles size={24} /></div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
                <p className="text-sm text-gray-500">Let's get your medical file set up securely.</p>
              </div>
            </div>

            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full z-0">
                <motion.div className="h-full bg-linear-to-r from-[#FC94AF] to-purple-500 rounded-full" initial={{ width: "0%" }} animate={{ width: currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "100%" }} transition={{ duration: 0.5 }} />
              </div>
              {[{ step: 1, icon: User, label: "Personal" }, { step: 2, icon: PhoneCall, label: "Contact" }, { step: 3, icon: FileText, label: "Medical" }].map((item) => (
                <div key={item.step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= item.step ? 'bg-[#FC94AF] text-white shadow-lg shadow-[#FC94AF]/30' : 'bg-white dark:bg-[#1E1F22] border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}><item.icon size={18} /></div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block ${currentStep >= item.step ? 'text-[#FC94AF]' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="p-6 md:p-8 h-112 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={labelClass}>First Name</label><input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} placeholder="Jane" /></div>
                    <div><label className={labelClass}>Last Name</label><input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} placeholder="Doe" /></div>
                    <div><label className={labelClass}>Date of Birth</label><input type="date" value={formData.dob} onChange={handleDobChange} className={`${inputClass} scheme-light dark:scheme-dark`} /></div>
                    <div><label className={labelClass}>Age</label><input type="text" readOnly value={formData.age} className={`${inputClass} bg-gray-100 dark:bg-[#1a1b1e] text-gray-400`} placeholder="Auto-calculated" /></div>
                    <div><label className={labelClass}>Gender</label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputClass}><option value="Female">Female</option><option value="Male">Male</option><option value="Other">Other</option></select></div>
                    <div><label className={labelClass}>Marital Status</label><select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className={inputClass}><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option></select></div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Contact Details</h2>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className={labelClass}>Phone Number</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+1 (555) 000-0000" /></div>
                      <div><label className={labelClass}>Email Address</label><input type="email" readOnly value={userEmail} className={`${inputClass} bg-gray-100 dark:bg-[#1a1b1e] text-gray-400`} /></div>
                    </div>
                    <div><label className={labelClass}>Home Address</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="123 Main St, Apt 4B" /></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Emergency Contact (Next of Kin)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className={labelClass}>Full Name</label><input type="text" value={formData.nokName} onChange={e => setFormData({ ...formData, nokName: e.target.value })} className={inputClass} placeholder="John Doe" /></div>
                      <div><label className={labelClass}>Phone Number</label><input type="tel" value={formData.nokPhone} onChange={e => setFormData({ ...formData, nokPhone: e.target.value })} className={inputClass} placeholder="+1 (555) 999-9999" /></div>
                      <div className="md:col-span-2"><label className={labelClass}>Address</label><input type="text" value={formData.nokAddress} onChange={e => setFormData({ ...formData, nokAddress: e.target.value })} className={inputClass} placeholder="Can be same as above" /></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Health Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                    <div><label className={labelClass}>Height</label><div className="flex gap-2"><input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className={inputClass} placeholder="175" /><select value={formData.heightUnit} onChange={e => setFormData({ ...formData, heightUnit: e.target.value })} className="w-24 shrink-0 px-4 py-3 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 rounded-xl text-sm dark:text-white focus:border-[#FC94AF] outline-none"><option value="cm">cm</option><option value="in">in</option></select></div></div>
                    <div><label className={labelClass}>Weight</label><div className="flex gap-2"><input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className={inputClass} placeholder="70" /><select value={formData.weightUnit} onChange={e => setFormData({ ...formData, weightUnit: e.target.value })} className="w-24 shrink-0 px-4 py-3 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-800 rounded-xl text-sm dark:text-white focus:border-[#FC94AF] outline-none"><option value="kg">kg</option><option value="lb">lbs</option></select></div></div>
                    <div><label className={labelClass}>Blood Type</label><select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className={inputClass}><option value="">Unknown</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                    <div><label className={labelClass}>Genotype</label><select value={formData.genotype} onChange={e => setFormData({ ...formData, genotype: e.target.value })} className={inputClass}><option value="">Unknown</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select></div>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div><label className={labelClass}>Known Allergies</label><input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className={inputClass} placeholder="Separate with commas (e.g., Peanuts, Penicillin)" /></div>
                    <div><label className={labelClass}>Chronic Conditions</label><textarea value={formData.conditions} onChange={e => setFormData({ ...formData, conditions: e.target.value })} className={`${inputClass} resize-none h-20`} placeholder="Brief medical history..." /></div>
                  </div>
                  {formData.gender === 'Female' && (
                    <div className="p-4 border border-[#FC94AF]/30 bg-[#FC94AF]/5 rounded-2xl mt-4">
                      <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Baby size={18} className="text-[#FC94AF]" /> Pregnancy Status</h4><label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium"><input type="checkbox" checked={formData.isPregnant === 'Yes'} onChange={e => setFormData({ ...formData, isPregnant: e.target.checked ? 'Yes' : 'No' })} className="w-4 h-4 rounded border-gray-300 text-[#FC94AF] focus:ring-[#FC94AF]" /> Currently Pregnant?</label></div>
                      {formData.isPregnant === 'Yes' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                          <div><label className={labelClass}>Months</label><input type="number" value={formData.pregnancyMonths} onChange={e => setFormData({ ...formData, pregnancyMonths: e.target.value })} className={inputClass} placeholder="e.g., 6" /></div>
                          <div><label className={labelClass}>Expected Sex</label><select value={formData.pregnancySex} onChange={e => setFormData({ ...formData, pregnancySex: e.target.value })} className={inputClass}><option value="Unknown">Unknown</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                          <div><label className={labelClass}>Num of Babies</label><input type="number" min="1" value={formData.pregnancyBabies} onChange={e => setFormData({ ...formData, pregnancyBabies: e.target.value })} className={inputClass} /></div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-6 md:px-8 md:py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#14151A]/50 flex justify-between items-center">
            <button onClick={handlePrev} disabled={currentStep === 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
              <ChevronLeft size={18} /> Back
            </button>

            {currentStep < 3 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-80 transition-opacity shadow-lg">
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-[#FC94AF] to-purple-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#FC94AF]/30 transition-all disabled:opacity-70 disabled:animate-pulse">
                {isSubmitting ? <><Activity size={18} className="animate-spin" /> Finalizing...</> : <><CheckCircle2 size={18} /> Complete Profile</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}