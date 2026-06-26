import Link from "next/link";

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Agents Registry</h1>
      <p className="mb-4">Discover registered AI agents on Stacks.</p>
      <a
        href="/"
        className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Back to Home
      </a>
    </div>
  );
}
