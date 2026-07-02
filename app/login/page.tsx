import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure access"
      title="Your revenue command center is ready."
      description="Sign in to manage leads, campaigns, WhatsApp workflows, AI agents, tasks, and role-based team operations from one protected workspace."
    >
      <LoginForm />
    </AuthShell>
  );
}
