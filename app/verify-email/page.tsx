import AuthShell from "@/components/auth/AuthShell";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

type PageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Verification"
      title="Confirm the email for your RDLeadify AI account."
      description="Verified email ownership keeps workspace access trustworthy before JWT sessions are issued."
    >
      <VerifyEmailForm initialToken={params?.token ?? ""} />
    </AuthShell>
  );
}
