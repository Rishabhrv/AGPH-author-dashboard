"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, Image as ImageIcon, CreditCard, User, FileText, Send, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { submitAuthorOnboarding } from "@/actions/auth";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function AuthorOnboardingForm({ onComplete, onSkip }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    idNumber: "",
    bio: "",
  });

  // Files
  const [photo, setPhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [success, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
  };

  const validateStep = (step: Step) => {
    const newErrors: Record<string, boolean> = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = true;
      if (!formData.phone.trim()) newErrors.phone = true;
      if (!formData.email.trim() || !formData.email.includes("@")) newErrors.email = true;
      if (!formData.address.trim()) newErrors.address = true;
    } else if (step === 2) {
      if (!photo) newErrors.photo = true;
      if (!idProof) newErrors.idProof = true;
      if (!formData.idNumber.trim()) newErrors.idNumber = true;
    } else if (step === 3) {
      if (!formData.bio.trim()) newErrors.bio = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const submitForm = async () => {
    if (!consent) {
      setErrors({ ...errors, consent: true });
      return;
    }
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      let backendKey = key;
      if (key === "fullName") backendKey = "full_name";
      if (key === "address") backendKey = "full_address";
      if (key === "idNumber") backendKey = "id_proof_number";
      formDataToSend.append(backendKey, value);
    });
    if (photo) formDataToSend.append("photo", photo);
    if (idProof) formDataToSend.append("id_proof", idProof);

    const result = await submitAuthorOnboarding(formDataToSend);

    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
    } else {
      alert("Failed to submit profile. Please try again.");
    }
  };

  const stepList = [
    { num: 1, title: "Personal Details", icon: User },
    { num: 2, title: "Documents", icon: CreditCard },
    { num: 3, title: "Publication", icon: FileText },
    { num: 4, title: "Review", icon: ShieldCheck },
  ];

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="max-w-sm w-full mx-4 bg-white rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden border border-white/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative w-24 h-24 mx-auto mb-6">
             <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
             <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
               <CheckCircle2 size={44} className="text-emerald-500" />
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 relative z-10">Profile Submitted!</h2>
          <p className="text-sm text-slate-500 mb-8 relative z-10">
            Thank you for completing your author profile. Our team will verify your details shortly.
          </p>

          <button 
            onClick={onComplete} 
            className="w-full relative overflow-hidden group bg-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 z-10"
          >
            <div className="absolute inset-0 bg-indigo-500 w-[0%] group-hover:w-full transition-all duration-300 ease-out z-0"></div>
            <span className="relative z-10">Enter Dashboard</span>
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700/50 text-[11px] ring-1 ring-white/20">
              {countdown}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 items-center justify-center">
      <div className="bg-white w-full max-w-5xl mx-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-full border border-slate-200">
        
        {/* SIDEBAR */}
        <div className="md:w-[320px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white p-8 md:p-10 shrink-0 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Complete Profile</h1>
            <p className="text-indigo-100 text-sm mb-10 leading-relaxed">
              We need a few details to finalize your author account and prepare your dashboard.
            </p>

            <div className="space-y-1">
              {stepList.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div key={step.num} className="relative flex items-center gap-4 py-3 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-white text-indigo-600 shadow-md ring-4 ring-indigo-400" : isPassed ? "bg-indigo-400 text-white" : "bg-indigo-800/50 text-indigo-300"}`}>
                      {isPassed ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isActive ? "text-indigo-200" : "text-indigo-300"}`}>Step {step.num}</p>
                      <p className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-indigo-200"}`}>{step.title}</p>
                    </div>
                    {idx !== stepList.length - 1 && (
                      <div className={`absolute top-[48px] left-5 w-[2px] h-4 -ml-[1px] ${isPassed ? "bg-indigo-400" : "bg-indigo-800/50"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-auto pt-8 relative z-10">
            <button onClick={onSkip} className="text-sm font-medium text-indigo-200 hover:text-white transition-colors flex items-center gap-1.5 opacity-80 hover:opacity-100">
              Skip for now <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar relative">
          
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Personal Details</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Please provide your legal name and contact information.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Legal Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
                    className={`w-full px-4 py-3 bg-white border ${errors.fullName ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                    placeholder="e.g. Priyanshu Sharma" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                      className={`w-full px-4 py-3 bg-white border ${errors.phone ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                      placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} 
                      className={`w-full px-4 py-3 bg-white border ${errors.email ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                      placeholder="author@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Residential Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className={`w-full px-4 py-3 bg-white border ${errors.address ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none`} 
                    placeholder="Full street address, city, state, and ZIP"></textarea>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Identity & Documents</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Upload your author photo and identity proof.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profile Photo</label>
                  <label className={`group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${errors.photo ? "border-rose-300 bg-rose-50" : photo ? "border-indigo-200 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPhoto(e.target.files[0]);
                        setErrors({...errors, photo: false});
                      }
                    }} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${photo ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}>
                      {photo ? <Check size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${photo ? "text-indigo-900" : "text-slate-700"}`}>{photo ? photo.name : "Upload high-res photo"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{photo ? "Click to change" : "JPG, PNG (Max 5MB)"}</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Government ID Proof</label>
                  <label className={`group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${errors.idProof ? "border-rose-300 bg-rose-50" : idProof ? "border-indigo-200 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setIdProof(e.target.files[0]);
                        setErrors({...errors, idProof: false});
                      }
                    }} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${idProof ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}>
                      {idProof ? <Check size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${idProof ? "text-indigo-900" : "text-slate-700"}`}>{idProof ? idProof.name : "Upload ID Document"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{idProof ? "Click to change" : "Aadhaar, Passport, SSN (PDF/JPG)"}</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ID Proof Number</label>
                  <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} 
                    className={`w-full px-4 py-3 bg-white border ${errors.idNumber ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                    placeholder="e.g. AADHAAR: XXXX XXXX XXXX" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Publication Terms</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Define your author persona and confirm publication specifics.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author Biography</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5}
                    className={`w-full px-4 py-3 bg-white border ${errors.bio ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none`} 
                    placeholder="Tell your readers about yourself, your background, and your inspiration..."></textarea>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">This will be printed on your book covers and author page.</p>
                </div>

              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all">
                  Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Final Review</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Verify your details before submitting your profile.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div className="text-slate-500 font-medium">Full Name</div>
                  <div className="font-semibold text-slate-800 text-right">{formData.fullName}</div>
                  
                  <div className="text-slate-500 font-medium">Contact</div>
                  <div className="font-semibold text-slate-800 text-right truncate" title={formData.email}>{formData.email}<br/><span className="text-slate-500">{formData.phone}</span></div>
                  
                  <div className="text-slate-500 font-medium flex items-center h-full">Documents</div>
                  <div className="font-semibold text-emerald-600 text-right flex items-center justify-end gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Uploaded
                  </div>
                </div>
              </div>

              <label className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${errors.consent ? "bg-rose-50 border-rose-200" : consent ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input type="checkbox" className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded shrink-0 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer" 
                    checked={consent} onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setErrors({...errors, consent: false});
                    }} />
                  <Check size={14} strokeWidth={3} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm text-slate-700 leading-relaxed font-medium">
                  I confirm that all information provided is accurate. I agree that AGPH Books may use these details for publication agreements and official correspondence.
                </span>
              </label>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} disabled={isSubmitting} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50">
                  Back
                </button>
                <button onClick={submitForm} disabled={isSubmitting || !consent} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-indigo-200" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Profile <Send size={16} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
