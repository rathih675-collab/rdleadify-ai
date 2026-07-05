import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white">
      <section className="max-w-md rounded-2xl border border-white/10 bg-white/[0.055] p-6 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-300" />
        <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your account does not have permission to access this area or has been suspended.
        </p>
      </section>
    </main>
  );
}
