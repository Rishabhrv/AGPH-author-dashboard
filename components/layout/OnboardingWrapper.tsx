"use client";

import { useState, useEffect } from "react";
import AuthorOnboardingForm from "../profile/AuthorOnboardingForm";
import { AlertTriangle } from "lucide-react";
import { getAuthorProfileData } from "@/actions/auth";

export default function OnboardingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSkipped, setIsSkipped] = useState(false);
  const [completed, setCompleted] = useState(true); // Default true to avoid flash
  const [loading, setLoading] = useState(true);
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user previously skipped on this device
    const skipped = localStorage.getItem("onboarding_skipped") === "true";
    if (skipped) setIsSkipped(true);

    getAuthorProfileData().then((profile) => {
      if (profile) {
        setAuthorProfile(profile);
        if (profile.isOnboarded === false || profile.isApproved === 2) {
          setCompleted(false);
        }
        if (profile.isApproved === 2) {
          setIsSkipped(false); // Force them to see the form if rejected
          localStorage.removeItem("onboarding_skipped");
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSkip = () => {
    setIsSkipped(true);
    localStorage.setItem("onboarding_skipped", "true");
  };

  const handleComplete = () => {
    setCompleted(true);
    localStorage.removeItem("onboarding_skipped");
  };

  if (loading) {
    return <>{children}</>;
  }

  if (completed) {
    return <>{children}</>;
  }

  return (
    <>
      {isSkipped && (
        <div className={`border rounded-lg p-3 flex items-center justify-between mb-4 shadow-sm ${authorProfile?.isApproved === 2 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={authorProfile?.isApproved === 2 ? "text-rose-500" : "text-amber-500"} size={20} />
            <p className={`text-sm font-medium ${authorProfile?.isApproved === 2 ? 'text-rose-800' : 'text-amber-800'}`}>
              {authorProfile?.isApproved === 2 
                ? `Your profile verification was rejected: ${authorProfile.remark}. Please update it.` 
                : "Please complete your author onboarding form to avoid delays in publication and payouts."}
            </p>
          </div>
          <button 
            onClick={() => setIsSkipped(false)}
            className={`text-sm px-4 py-1.5 rounded-md font-semibold transition-colors ${authorProfile?.isApproved === 2 ? 'bg-rose-100 hover:bg-rose-200 text-rose-900' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'}`}
          >
            Complete Now
          </button>
        </div>
      )}

      {children}

      {!isSkipped && !completed && (
        <AuthorOnboardingForm 
          onComplete={handleComplete} 
          onSkip={handleSkip} 
          initialProfile={authorProfile}
        />
      )}
    </>
  );
}
