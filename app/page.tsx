import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-bold text-emerald-400">
          RDLeadify AI
        </h1>

        <p className="mt-6 max-w-2xl text-center text-lg text-gray-300">
          AI Voice Agent • WhatsApp API • CRM • Workflow Automation
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black hover:bg-emerald-400"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-600 px-6 py-3 font-semibold hover:bg-gray-800"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold">🤖 AI Voice Agent</h2>
            <p className="mt-2 text-gray-400">
              Human-like AI voice calls with ElevenLabs integration.
            </p>
          </div>

          <div className="rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold">💬 WhatsApp Automation</h2>
            <p className="mt-2 text-gray-400">
              Auto replies, campaigns, follow-ups and lead capture.
            </p>
          </div>

          <div className="rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold">📊 Smart CRM</h2>
            <p className="mt-2 text-gray-400">
              Manage leads, pipeline, appointments and automations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
