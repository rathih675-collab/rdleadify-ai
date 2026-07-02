type SendVerificationOtpEmailInput = {
  to: string;
  name: string;
  otp: string;
  purpose?: "verify" | "reset";
};

type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "missing_config" | "failed" };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationOtpEmail({
  to,
  name,
  otp,
  purpose = "verify",
}: SendVerificationOtpEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { sent: false, reason: "missing_config" };
  }

  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);
  const isReset = purpose === "reset";
  const heading = isReset
    ? "Reset your RDLeadify AI password"
    : "Verify your RDLeadify AI account";
  const intro = isReset
    ? "Use this one-time password to continue your password reset."
    : "Use this one-time password to activate your AI CRM workspace.";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "RDLeadify AI <onboarding@resend.dev>",
      to,
      subject: isReset
        ? "Reset your RDLeadify AI password"
        : "Verify your RDLeadify AI Account",
      html: `
        <div style="margin:0;padding:0;background:#050b16;color:#e5eefc;font-family:Arial,Helvetica,sans-serif">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#050b16 0%,#07111f 45%,#052e25 100%);padding:40px 16px">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid rgba(255,255,255,.14);border-radius:22px;background:rgba(11,22,40,.92);box-shadow:0 24px 80px rgba(0,0,0,.35);overflow:hidden">
                  <tr>
                    <td style="padding:30px 30px 10px">
                      <div style="display:inline-block;border-radius:14px;background:linear-gradient(135deg,#34d399,#10b981);color:#07111f;font-weight:900;font-size:18px;padding:12px 14px">RD</div>
                      <h1 style="margin:22px 0 8px;color:#ffffff;font-size:28px;line-height:1.2">${heading}</h1>
                      <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.7">Hi ${safeName}, ${intro}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 30px">
                      <div style="border-radius:18px;background:linear-gradient(135deg,#34d399,#14b8a6);padding:2px">
                        <div style="border-radius:16px;background:#07111f;padding:26px;text-align:center">
                          <p style="margin:0 0 10px;color:#a7f3d0;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:700">Your verification OTP</p>
                          <div style="font-size:42px;letter-spacing:12px;font-weight:900;color:#ffffff;line-height:1">${safeOtp}</div>
                        </div>
                      </div>
                      <p style="margin:18px 0 0;color:#fbbf24;font-size:14px;line-height:1.6;text-align:center">This OTP expires in 10 minutes. Never share it with anyone.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 30px 30px">
                      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:18px">
                        <p style="margin:0 0 8px;color:#cbd5e1;font-size:13px;line-height:1.7"><strong>Security warning:</strong> RDLeadify AI will never ask for this OTP over phone, chat, or WhatsApp.</p>
                        <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.7">If this request was not made from your device, ignore this email and review your account security.</p>
                        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.7">Need help? Contact RDLeadify AI support from your workspace settings.</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: "failed" };
  }

  return { sent: true };
}
