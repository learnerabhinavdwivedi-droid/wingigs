import { OnboardingForm } from '../../features/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-100 flex flex-col gap-6">
      <OnboardingForm />
    </main>
  );
}
