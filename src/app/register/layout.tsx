import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | ProofMe - Verify Before You Pay",
  description: "Create your ProofMe account to begin reporting scam incidents, tracking dynamic trust scores, and verifying bank or phone information.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
