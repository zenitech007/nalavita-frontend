'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Camera, FileText, CheckCircle2, Loader2, ScanLine } from 'lucide-react';

interface UploadPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (extractedData: any) => void;
    doctorId: string;
}

export default function UploadPatientModal({ isOpen, onClose, onSuccess }: UploadPatientModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        setFile(selectedFile);
        simulateAIScan();
    };

    const simulateAIScan = () => {
        setIsScanning(true);
        
        // Simulate API call to your AI Parsing endpoint
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            
            // This is the simulated structured data Amelia AI extracted from the document
            const mockExtractedData = {
                firstName: 'Sarah',
                lastName: 'Connor',
                dob: '1985-08-29',
                age: '38',
                gender: 'Female',
                phone: '+1 (555) 867-5309',
                email: 's.connor@example.com',
                address: '123 Tech Noir St, LA',
                bp: '118/76',
                hr: '72',
                temp: '37.1',
                o2Sat: '99',
                bloodType: 'O-',
                allergies: 'Penicillin',
                conditions: 'Mild anxiety, historical trauma.',
                currentMedication: 'Ibuprofen as needed',
                height: '165',
                weight: '62'
            };

            setTimeout(() => {
                if (onSuccess) onSuccess(mockExtractedData); // Pass the data out!
                resetAndClose();
            }, 1500);
        }, 3000);
    };

    const resetAndClose = () => {
        setFile(null);
        setIsScanning(false);
        setScanComplete(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#1E1F22] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#FC94AF]/10 p-2 rounded-xl"><ScanLine size={20} className="text-[#FC94AF]" /></div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Amelia AI Scanner</h2>
                    </div>
                    <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-[#121315] p-2 rounded-full">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="upload-zone"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`relative flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive ? 'border-[#FC94AF] bg-[#FC94AF]/5 scale-[1.02]' : 'border-gray-300 dark:border-gray-700 hover:border-[#FC94AF]/50 bg-gray-50/50 dark:bg-[#121315]/50'}`}
                            >
                                <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleChange} className="hidden" />

                                <div className="flex gap-4 mb-4">
                                    <button onClick={() => inputRef.current?.click()} className="p-4 bg-white dark:bg-[#1E1F22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-[#FC94AF] hover:border-[#FC94AF]/50 transition-all group">
                                        <UploadCloud size={32} className="group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                    <button onClick={() => inputRef.current?.click()} className="p-4 bg-white dark:bg-[#1E1F22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-500 hover:border-blue-500/50 transition-all group">
                                        <Camera size={32} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Upload or Capture Record</h3>
                                <p className="text-xs text-gray-500 text-center max-w-62.5">Drag & drop a patient intake form, ID, or lab result here.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="scanning-zone"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-10"
                            >
                                <div className="relative w-24 h-32 bg-gray-100 dark:bg-[#121315] rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-6 shadow-inner">
                                    <FileText size={40} className="text-gray-300 dark:text-gray-600" />

                                    {/* AI Laser Scanner Animation */}
                                    {isScanning && (
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-0.5 bg-[#FC94AF] shadow-[0_0_8px_2px_rgba(252,148,175,0.8)] z-10"
                                        />
                                    )}
                                </div>

                                {isScanning ? (
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-[#FC94AF] font-semibold">
                                            <Loader2 size={18} className="animate-spin" /> Extracting Data...
                                        </div>
                                        <p className="text-xs text-gray-500">Amelia is parsing handwritten notes and vitals.</p>
                                    </div>
                                ) : scanComplete ? (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-lg">
                                            <CheckCircle2 size={24} /> Success!
                                        </div>
                                        <p className="text-xs text-gray-500">Data structured. Routing to patient file.</p>
                                    </motion.div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}