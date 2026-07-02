import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

type CrmModulePageProps = {
  title: string;
  description: string;
};

const moduleCards = [
  {
    label: "Workspace Readiness",
    value: "Enterprise setup",
    description: "Structured data views, team workflows, and AI-ready actions.",
  },
  {
    label: "Automation Layer",
    value: "Coming online",
    description: "Smart triggers and guided operations designed for scale.",
  },
  {
    label: "Decision Signals",
    value: "Insights first",
    description: "Premium reporting surfaces for prioritization and follow-up.",
  },
];

export default function CrmModulePage({ title, description }: CrmModulePageProps) {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white">
      <Sidebar />

      <main className="flex-1">
        <Topbar eyebrow="RDLeadify AI" title={title} />

        <section className="p-6 lg:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              CRM Module
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              {description}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {moduleCards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/10"
              >
                <p className="text-sm font-medium text-slate-400">{card.label}</p>
                <h2 className="mt-4 text-xl font-bold text-white">{card.value}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Coming next
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">{title} workspace</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              This area is ready for production workflows, advanced filters, role-based
              actions, bulk operations, analytics, and AI-assisted recommendations.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
