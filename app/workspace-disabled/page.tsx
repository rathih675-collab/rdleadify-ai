import { Building2 } from "lucide-react";

export default function WorkspaceDisabledPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white">
      <section className="max-w-md rounded-2xl border border-white/10 bg-white/[0.055] p-6 text-center">
        <Building2 className="mx-auto h-10 w-10 text-rose-300" />
        <h1 className="mt-4 text-2xl font-bold">Workspace Disabled</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          This workspace is currently disabled. Contact your workspace owner or RDLeadify support.
        </p>
      </section>
    </main>
  );
}
