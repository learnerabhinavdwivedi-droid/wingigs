import { OnboardingForm } from '../../features/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center text-black">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <OnboardingForm />
      </div>
    </main>
  );
}
