import { OnboardingForm } from '../../features/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full relative z-10 py-6">
        <OnboardingForm />
      </div>
    </main>
  );
}
