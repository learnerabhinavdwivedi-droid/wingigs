import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-black">
      <h1 className="text-5xl font-extrabold mb-4">Bahar</h1>
      <p className="text-xl mb-8 max-w-md text-center">
        The resilient training app. Works offline, expects failure, builds momentum.
      </p>
      <Link 
        href="/today"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700"
      >
        Open App
      </Link>
    </main>
  );
}
