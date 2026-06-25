import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ProofMe - Verify Before You Pay",
  description: "Sign in to your ProofMe account to verify phone numbers, bank details, report scams, and manage trust data.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
