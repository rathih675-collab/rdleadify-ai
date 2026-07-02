import AuthShell from "@/components/auth/AuthShell";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

type PageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Verification"
      title="Confirm the email for your RDLeadify AI account."
      description="Use the 6 digit OTP from your inbox to activate secure login for your AI CRM workspace."
    >
      <VerifyEmailForm initialEmail={params?.email ?? ""} />
    </AuthShell>
  );
}
