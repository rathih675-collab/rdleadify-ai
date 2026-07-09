import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Restore account access without weakening security."
      description="Password reset uses a short-lived email OTP and strong password validation."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
