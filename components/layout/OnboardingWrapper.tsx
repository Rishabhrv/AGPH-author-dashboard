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
        if (profile.isOnboarded === false) {
          setCompleted(false);
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={20} />
            <p className="text-sm font-medium text-amber-800">
              Please complete your author onboarding form to avoid delays in publication and payouts.
            </p>
          </div>
          <button 
            onClick={() => setIsSkipped(false)}
            className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-1.5 rounded-md font-semibold transition-colors"
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
