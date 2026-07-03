export function canShowDevOtp() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_OTP_UI === "true"
  );
}
