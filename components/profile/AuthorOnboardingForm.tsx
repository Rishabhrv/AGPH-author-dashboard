"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, Image as ImageIcon, CreditCard, User, FileText, Send, CheckCircle2, ShieldCheck, Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import { submitAuthorOnboarding } from "@/actions/auth";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  initialProfile?: any;
}

export default function AuthorOnboardingForm({ onComplete, onSkip, initialProfile }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Form State
  const [formData, setFormData] = useState({
    fullName: initialProfile?.legalName || initialProfile?.authorName || "",
    phone: initialProfile?.phone || "",
    email: initialProfile?.email || "",
    address: initialProfile?.address || "",
    idType: initialProfile?.idProofType || "Aadhaar Card",
    bio: initialProfile?.bio || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (key === "idType") backendKey = "id_proof_type";

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
        <div className="max-w-sm w-full mx-4 bg-white rounded-2xl p-10 text-center shadow-xl relative overflow-hidden border border-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#275697]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 relative z-10">Profile Submitted!</h2>
          <p className="text-sm text-slate-500 mb-8 relative z-10">
            Thank you for completing your author profile. Our team will verify your details shortly.
          </p>

          <button
            onClick={onComplete}
            className="w-full relative overflow-hidden group bg-[#275697] text-white py-3 rounded-xl font-bold shadow-sm hover:bg-[#1e447a] transition-all flex items-center justify-center gap-2 z-10"
          >
            <span className="relative z-10">Enter Dashboard</span>
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#1e447a]/50 text-[11px] ring-1 ring-white/20">
              {countdown}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 items-center justify-center">
      <div className="bg-white w-full max-w-5xl mx-auto rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row max-h-full border border-slate-200">

        {/* SIDEBAR */}
        <div className="md:w-[320px] bg-slate-900 border-r border-slate-800 text-white p-8 md:p-10 shrink-0 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#275697]/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-sm font-bold tracking-wide text-slate-300 uppercase mb-1">Author Onboarding</p>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-2xl mb-4">Complete Profile</h1>
            <p className="text-sm font-medium text-slate-400 mb-5 leading-relaxed">
              We need a few details to finalize your author account and prepare your dashboard.
            </p>

            <div className="space-y-1">
              {stepList.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div key={step.num} className="relative flex items-center gap-4 py-3 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-[#0ea5e9] text-white shadow-md ring-4 ring-[#0ea5e9]/20" : isPassed ? "bg-white/10 text-slate-300" : "bg-white/5 text-slate-500"}`}>
                      {isPassed ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isActive ? "text-[#0ea5e9]" : "text-slate-500"}`}>Step {step.num}</p>
                      <p className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-slate-400"}`}>{step.title}</p>
                    </div>
                    {idx !== stepList.length - 1 && (
                      <div className={`absolute top-[48px] left-5 w-[2px] h-4 -ml-[1px] ${isPassed ? "bg-white/10" : "bg-white/5"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-8 relative z-10">
            <button onClick={onSkip} className="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 opacity-90 hover:opacity-100 rounded-md border border-white/10 bg-white/5 px-4 py-2 uppercase tracking-wide w-fit">
              Skip for now <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white p-8 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar relative">

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              {initialProfile?.isRejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start shadow-sm mb-4">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-rose-800">Verification Rejected</h3>
                    <p className="text-sm text-rose-700 mt-1 leading-relaxed">
                      {initialProfile.rejectionReason || "There was an issue with your profile details or documents. Please update the correct information and resubmit."}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Details</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Please provide your legal name and contact information.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Legal Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white border ${errors.fullName ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-[#275697]"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all`}
                    placeholder="e.g. Priyanshu Sharma" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white border ${errors.phone ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-[#275697]"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all`}
                      placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white border ${errors.email ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-[#275697]"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all`}
                      placeholder="author@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className={`w-full px-4 py-3 bg-white border ${errors.address ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-[#275697]"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all resize-none`}
                    placeholder="Full street address, city, state, and ZIP"></textarea>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button onClick={handleNext} className="bg-[#275697] hover:bg-[#1e447a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Identity & Documents</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Upload your author photo and identity proof.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Profile Photo</label>
                  <label className={`group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${errors.photo ? "border-rose-300 bg-rose-50" : photo ? "border-[#275697]/30 bg-[#275697]/5" : "border-slate-200 hover:border-[#275697]/50 hover:bg-slate-50"}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPhoto(e.target.files[0]);
                        setErrors({ ...errors, photo: false });
                      }
                    }} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${photo ? "bg-[#275697] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#275697]/10 group-hover:text-[#275697]"}`}>
                      {photo ? <Check size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${photo ? "text-slate-900" : "text-slate-700"}`}>{photo ? photo.name : "Upload high-res photo"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{photo ? "Click to change" : "JPG, PNG (Max 5MB)"}</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Government ID Proof</label>
                  <label className={`group flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${errors.idProof ? "border-rose-300 bg-rose-50" : idProof ? "border-[#275697]/30 bg-[#275697]/5" : "border-slate-200 hover:border-[#275697]/50 hover:bg-slate-50"}`}>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setIdProof(e.target.files[0]);
                        setErrors({ ...errors, idProof: false });
                      }
                    }} />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${idProof ? "bg-[#275697] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#275697]/10 group-hover:text-[#275697]"}`}>
                      {idProof ? <Check size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${idProof ? "text-slate-900" : "text-slate-700"}`}>{idProof ? idProof.name : "Upload ID Document"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{idProof ? "Click to change" : "Aadhaar, Passport, SSN (PDF/JPG)"}</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">ID Type</label>
                    <div className="relative">
                      <select name="idType" value={formData.idType} onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#275697] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all appearance-none pr-10">
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Passport">Passport</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-[#275697] hover:bg-[#1e447a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Publication Terms</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Define your author persona and confirm publication specifics.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Author Biography</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5}
                    className={`w-full px-4 py-3 bg-white border ${errors.bio ? "border-rose-300 ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-[#275697]"} rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#275697]/10 transition-all resize-none`}
                    placeholder="Tell your readers about yourself, your background, and your inspiration..."></textarea>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">This will be printed on your book covers and author page.</p>
                </div>

              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Back
                </button>
                <button onClick={handleNext} className="bg-[#275697] hover:bg-[#1e447a] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all">
                  Review <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Final Review</h2>
                <p className="text-slate-500 mt-1.5 text-sm">Verify your details before submitting your profile.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div className="text-slate-500 font-medium">Full Name</div>
                  <div className="font-bold text-slate-900 text-right">{formData.fullName}</div>

                  <div className="text-slate-500 font-medium">Contact</div>
                  <div className="font-bold text-slate-900 text-right truncate" title={formData.email}>{formData.email}<br /><span className="text-slate-500 font-normal">{formData.phone}</span></div>

                  <div className="text-slate-500 font-medium">Address</div>
                  <div className="font-bold text-slate-900 text-right">{formData.address}</div>

                  <div className="text-slate-500 font-medium">ID Type</div>
                  <div className="font-bold text-slate-900 text-right">{formData.idType}</div>

                  <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <div className="text-slate-500 font-medium mb-1.5">Author Biography</div>
                    <div className="font-medium text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">{formData.bio}</div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
                    <div className="text-slate-500 font-medium">Documents (Photo & ID)</div>
                    <div className="font-bold text-emerald-600 text-right flex items-center justify-end gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Uploaded
                    </div>
                  </div>
                </div>
              </div>

              <label className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${errors.consent ? "bg-rose-50 border-rose-200" : consent ? "bg-[#275697]/5 border-[#275697]/30" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input type="checkbox" className="peer w-5 h-5 appearance-none border-2 border-slate-300 rounded shrink-0 checked:bg-[#275697] checked:border-[#275697] transition-colors cursor-pointer"
                    checked={consent} onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setErrors({ ...errors, consent: false });
                    }} />
                  <Check size={14} strokeWidth={3} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm text-slate-700 leading-relaxed font-medium">
                  I confirm that all information provided is accurate. I agree that AGPH Books may use these details for publication agreements and official correspondence.
                </span>
              </label>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button onClick={handlePrev} disabled={isSubmitting} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50">
                  Back
                </button>
                <button onClick={submitForm} disabled={isSubmitting || !consent}
                  className="bg-[#275697] hover:bg-[#1e447a] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white/70" />
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
