import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Restore account access without weakening security."
      description="Reset tokens are hashed, short lived, and scoped to the user workspace so recovery stays controlled."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
