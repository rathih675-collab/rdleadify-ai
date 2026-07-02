import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

type PageProps = {
  searchParams?: Promise<{ verified?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const successMessage =
    params?.verified === "1" ? "Email verified. You can now login." : "";

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Your revenue command center is ready."
      description="Sign in to manage leads, campaigns, WhatsApp workflows, AI agents, tasks, and role-based team operations from one protected workspace."
    >
      <LoginForm successMessage={successMessage} />
    </AuthShell>
  );
}
