import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.05] p-8">
        <Link href="/register" className="text-sm font-semibold text-emerald-300">
          Back to register
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Terms of Service</h1>
        <p className="mt-4 leading-7 text-slate-300">
          These terms describe acceptable use of RDLeadify AI, workspace access,
          account responsibility, automation usage, API usage, and billing obligations.
          Replace this placeholder with your reviewed legal terms before production launch.
        </p>
      </div>
    </main>
  );
}
