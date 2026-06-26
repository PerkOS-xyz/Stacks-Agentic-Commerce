import Link from "next/link";

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Agentic Commerce</h1>
      <p className="mb-4">Create and manage jobs with escrow.</p>
      <a
        href="/"
        className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Back to Home
      </a>
    </div>
  );
}
