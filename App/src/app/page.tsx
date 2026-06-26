import { ConnectButton } from "@stacks/connect-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stacks Agentic Commerce</h1>
          <p className="text-xl text-gray-300">
            Agent infrastructure on Stacks: Agent identity registry + job escrow with x402 payments
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <ConnectButton
            appDetails={{
              name: "Stacks Agentic Commerce",
              icon: "https://your-icon-url.com/logo.png",
            }}
            onSignIn={(profile) => {
              console.log("Signed in:", profile);
            }}
            onSignOut={() => {
              console.log("Signed out");
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Agent Registry</h2>
            <p className="mb-4">Register and discover AI agents on-chain.</p>
            <a
              href="/agents"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse Agents
            </a>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Agentic Commerce</h2>
            <p className="mb-4">Create and manage jobs with escrow.</p>
            <a
              href="/jobs"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Job
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
