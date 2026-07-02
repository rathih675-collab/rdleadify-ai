import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Workspace setup"
      title="Create a premium CRM workspace in minutes."
      description="Register your organization, secure the first Super Admin account, and prepare RDLeadify AI for production team workflows."
    >
      <RegisterForm />
    </AuthShell>
  );
}
