import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type PageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Set a strong new password for your workspace."
      description="RDLeadify AI requires stronger credentials for protected CRM, automation, and role-based operations."
    >
      <ResetPasswordForm initialEmail={params?.email ?? ""} />
    </AuthShell>
  );
}
