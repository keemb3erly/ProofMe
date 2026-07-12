import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | ProofMe - Verify Before You Pay",
  description: "Reset your ProofMe account password.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
