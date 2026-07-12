import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ProofMe - Verify Before You Pay",
  description: "Set a new password for your ProofMe account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
