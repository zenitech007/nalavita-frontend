'use client';

import { useState, useEffect } from 'react';
import { X, UserRound, Activity, FileText, PhoneCall, Baby, Sparkles } from 'lucide-react';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    doctorId: string;
    initialData?: any;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess, doctorId, initialData }: AddPatientModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expanded State with New Fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        age: '',
        gender: 'Male',
        maritalStatus: 'Single',
        phone: '',
        email: '',
        address: '',
        nokName: '',
        nokPhone: '',
        nokAddress: '',
        department: 'General',
        triageLevel: 'Low',
        status: 'Stable',
        bp: '',
        hr: '',
        temp: '',
        o2Sat: '',
        bloodType: '',
        genotype: '',
        allergies: '',
        conditions: '',
        currentMedication: '',
        // Physical dimensions
        height: '',
        heightUnit: 'cm', // 'cm' or 'in'
        weight: '',
        weightUnit: 'kg', // 'kg', 'lb', or 'oz'
        // Pregnancy fields
        isPregnant: 'No',
        pregnancyMonths: '',
        pregnancySex: 'Unknown',
        pregnancyBabies: '1'
    });

    // Listen for AI Extracted Data
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        } else if (!isOpen) {
            // Reset form when closed so old data doesn't bleed over
            setFormData({
                firstName: '', lastName: '', dob: '', age: '', gender: 'Male',
                maritalStatus: 'Single', phone: '', email: '', address: '',
                nokName: '', nokPhone: '', nokAddress: '',
                department: 'General', triageLevel: 'Low', status: 'Stable',
                bp: '', hr: '', temp: '', o2Sat: '', bloodType: '', genotype: '',
                allergies: '', conditions: '', currentMedication: '',
                isPregnant: 'No', pregnancyMonths: '', pregnancySex: 'Unknown', pregnancyBabies: '1',
                height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg'
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // Helper function to auto-calculate age from DOB
    const calculateAge = (dobString: string) => {
        if (!dobString) return '';
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDob = e.target.value;
        setFormData({ ...formData, dob: newDob, age: calculateAge(newDob) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert Height to cm if needed
        let heightCm = formData.height ? parseFloat(formData.height) : null;
        if (heightCm && formData.heightUnit === 'in') {
            heightCm = parseFloat((heightCm * 2.54).toFixed(2));
        }

        // Convert Weight to kg if needed
        let weightKg = formData.weight ? parseFloat(formData.weight) : null;
        if (weightKg) {
            if (formData.weightUnit === 'lb') {
                weightKg = parseFloat((weightKg * 0.453592).toFixed(2));
            } else if (formData.weightUnit === 'oz') {
                weightKg = parseFloat((weightKg * 0.0283495).toFixed(2));
            }
        }

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, heightCm, weightKg, doctorId }),
            });

            if (!res.ok) throw new Error("Failed to add patient");

            onSuccess(); // Triggers a refetch in the parent component

            // Reset form on success
            setFormData({
                firstName: '', lastName: '', dob: '', age: '', gender: 'Male',
                maritalStatus: 'Single', phone: '', email: '', address: '',
                nokName: '', nokPhone: '', nokAddress: '',
                department: 'General', triageLevel: 'Low', status: 'Stable',
                bp: '', hr: '', temp: '', o2Sat: '', bloodType: '', genotype: '',
                allergies: '', conditions: '', currentMedication: '', height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg',
                isPregnant: 'No', pregnancyMonths: '', pregnancySex: 'Unknown', pregnancyBabies: '1'
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to add patient. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FC94AF] transition-colors";
    const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider";
    const sectionHeaderClass = "text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800 mt-6 first:mt-0";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">

            <div className="bg-white dark:bg-[#1E1F22] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121315]/50 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Register New Patient</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Complete the clinical intake form below.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#FC94AF] transition-colors bg-white dark:bg-[#1E1F22] p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                    <form id="add-patient-form" onSubmit={handleSubmit} className="space-y-2">

                        {/* SECTION 1: Demographics */}
                        <div>
                            <h3 className={sectionHeaderClass}><UserRound size={16} className="text-[#FC94AF]" /> Patient Demographics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} placeholder="Jane" />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} placeholder="Doe" />
                                </div>
                                <div>
                                    <label className={labelClass}>Date of Birth *</label>
                                    <input required type="date" value={formData.dob} onChange={handleDobChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Age</label>
                                    <input type="number" value={formData.age} readOnly className={`${inputClass} bg-gray-100 dark:bg-[#1a1b1e] cursor-not-allowed`} placeholder="Auto-calculated" />
                                </div>
                                <div>
                                    <label className={labelClass}>Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Marital Status</label>
                                    <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className={inputClass}>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 1B: Pregnancy Details (Conditional) */}
                        {formData.gender === 'Female' && (
                            <div className="mt-4 p-4 border border-[#FC94AF]/30 bg-[#FC94AF]/5 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Baby size={16} className="text-[#FC94AF]" /> Pregnancy Status
                                    </h4>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input type="checkbox" checked={formData.isPregnant === 'Yes'} onChange={e => setFormData({ ...formData, isPregnant: e.target.checked ? 'Yes' : 'No' })} className="rounded text-[#FC94AF] focus:ring-[#FC94AF]" />
                                        Currently Pregnant?
                                    </label>
                                </div>

                                {formData.isPregnant === 'Yes' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                        <div>
                                            <label className={labelClass}>Months</label>
                                            <input type="number" value={formData.pregnancyMonths} onChange={e => setFormData({ ...formData, pregnancyMonths: e.target.value })} className={inputClass} placeholder="e.g., 6" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Expected Sex</label>
                                            <select value={formData.pregnancySex} onChange={e => setFormData({ ...formData, pregnancySex: e.target.value })} className={inputClass}>
                                                <option value="Unknown">Unknown</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Number of Babies</label>
                                            <input type="number" min="1" value={formData.pregnancyBabies} onChange={e => setFormData({ ...formData, pregnancyBabies: e.target.value })} className={inputClass} placeholder="1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION 2: Contact & Emergency */}
                        <div>
                            <h3 className={sectionHeaderClass}><PhoneCall size={16} className="text-[#FC94AF]" /> Contact & Emergency</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className={labelClass}>Phone Number</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+1 (555) 000-0000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="patient@example.com" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Home Address</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="123 Main St, City, State, ZIP" />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-100/50 dark:bg-[#1a1b1e] rounded-lg border border-gray-200 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Next of Kin / Emergency Contact</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Contact Name</label>
                                        <input type="text" value={formData.nokName} onChange={e => setFormData({ ...formData, nokName: e.target.value })} className={inputClass} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Contact Phone</label>
                                        <input type="tel" value={formData.nokPhone} onChange={e => setFormData({ ...formData, nokPhone: e.target.value })} className={inputClass} placeholder="+1 (555) 999-9999" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Contact Home Address</label>
                                        <input type="text" value={formData.nokAddress} onChange={e => setFormData({ ...formData, nokAddress: e.target.value })} className={inputClass} placeholder="Same as patient, or 456 Alt St..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Clinical Routing */}
                        <div>
                            <h3 className={sectionHeaderClass}><Activity size={16} className="text-[#FC94AF]" /> Clinical Routing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Department / Ward</label>
                                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className={inputClass} placeholder="e.g., ICU-Bed 4" />
                                </div>
                                <div>
                                    <label className={labelClass}>Triage Level</label>
                                    <select value={formData.triageLevel} onChange={e => setFormData({ ...formData, triageLevel: e.target.value })} className={inputClass}>
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Current Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                                        <option value="Stable">Stable</option>
                                        <option value="Review Needed">Review Needed</option>
                                        <option value="Critical">Critical</option>
                                        <option value="Discharged">Discharged</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Initial Vitals */}
                        <div>
                            <h3 className={sectionHeaderClass}><Activity size={16} className="text-[#FC94AF]" /> Initial Vitals</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className={labelClass}>BP (mmHg)</label>
                                    <input type="text" value={formData.bp} onChange={e => setFormData({ ...formData, bp: e.target.value })} className={inputClass} placeholder="120/80" />
                                </div>
                                <div>
                                    <label className={labelClass}>HR (bpm)</label>
                                    <input type="number" value={formData.hr} onChange={e => setFormData({ ...formData, hr: e.target.value })} className={inputClass} placeholder="72" />
                                </div>
                                <div>
                                    <label className={labelClass}>Temp (°C)</label>
                                    <input type="number" step="0.1" value={formData.temp} onChange={e => setFormData({ ...formData, temp: e.target.value })} className={inputClass} placeholder="36.5" />
                                </div>
                                <div>
                                    <label className={labelClass}>SpO2 (%)</label>
                                    <input type="number" value={formData.o2Sat} onChange={e => setFormData({ ...formData, o2Sat: e.target.value })} className={inputClass} placeholder="98" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5: Medical Profile */}
                        <div>
                            <h3 className={sectionHeaderClass}><FileText size={16} className="text-[#FC94AF]" /> Medical Profile</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {/* Blood Type & Genotype Additions */}
                                <div>
                                    <label className={labelClass}>Blood Type</label>
                                    <select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className={inputClass}>
                                        <option value="">Unknown</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Genotype</label>
                                    <select value={formData.genotype} onChange={e => setFormData({ ...formData, genotype: e.target.value })} className={inputClass}>
                                        <option value="">Unknown</option>
                                        <option value="AA">AA</option>
                                        <option value="AS">AS</option>
                                        <option value="SS">SS</option>
                                        <option value="SC">SC</option>
                                    </select>
                                </div>
                            </div>
                            {/* Height & Weight Additions */}
                            {/* Height & Weight Additions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className={labelClass}>Height</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g., 175"
                                        />
                                        <select
                                            value={formData.heightUnit}
                                            onChange={e => setFormData({ ...formData, heightUnit: e.target.value })}
                                            /* Removed w-full, explicitly defined fixed width and styles */
                                            className="w-24 shrink-0 px-3 py-2 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FC94AF] transition-colors"
                                        >
                                            <option value="cm">cm</option>
                                            <option value="in">inches</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Weight</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g., 70"
                                        />
                                        <select
                                            value={formData.weightUnit}
                                            onChange={e => setFormData({ ...formData, weightUnit: e.target.value })}
                                            /* Removed w-full, explicitly defined fixed width and styles */
                                            className="w-24 shrink-0 px-3 py-2 bg-gray-50 dark:bg-[#121315] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#FC94AF] transition-colors"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lb">lbs</option>
                                            <option value="oz">oz</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Known Allergies</label>
                                    <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className={inputClass} placeholder="e.g., Penicillin, Peanuts (Leave blank if none)" />
                                </div>
                                <div>
                                    <label className={labelClass}>Current Medication</label>
                                    <input type="text" value={formData.currentMedication} onChange={e => setFormData({ ...formData, currentMedication: e.target.value })} className={inputClass} placeholder="e.g., Lisinopril 10mg daily" />
                                </div>
                                <div>
                                    <label className={labelClass}>Pre-existing Conditions / Notes</label>
                                    <textarea
                                        value={formData.conditions}
                                        onChange={e => setFormData({ ...formData, conditions: e.target.value })}
                                        className={`${inputClass} resize-none h-20`}
                                        placeholder="Brief medical history or intake notes..."
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121315]/50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                    >
                        Cancel
                    </button>
                    <button
                        form="add-patient-form"
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 bg-[#FC94AF] hover:bg-[#E07A96] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <><Activity size={16} className="animate-spin mr-2" /> Saving Record...</>
                        ) : (
                            "Register Patient"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}