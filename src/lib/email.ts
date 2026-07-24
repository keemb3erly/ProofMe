import { BrevoClient, BrevoError } from "@getbrevo/brevo";

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new EmailDeliveryError("BREVO_API_KEY is not configured.");
  }

  return new BrevoClient({
    apiKey,
  });
}

function getBrevoErrorMessage(error: BrevoError): string {
  if (
    error.body &&
    typeof error.body === "object" &&
    "message" in error.body &&
    typeof error.body.message === "string"
  ) {
    return error.body.message;
  }

  return error.message || "Password reset email could not be sent.";
}

export async function sendPasswordResetEmail({
  email,
  resetLink,
}: {
  email: string;
  resetLink: string;
}) {
  const brevo = getBrevoClient();

  try {
    return await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "ProofMe",
        email: process.env.BREVO_SENDER_EMAIL || "el.ucheee@gmail.com",
      },
      to: [{ email }],
      subject: "Reset your ProofMe password",
      htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;padding:40px;border:1px solid #e2e8f0;">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <span style="font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">ProofMe</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:8px;">
                      <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">Reset your password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
                        We received a request to reset the password for your ProofMe account. Click the button below to set a new password.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <a href="${resetLink}" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;text-align:center;">
                        This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;padding-top:24px;">
                      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                        ProofMe &mdash; Verify Before You Pay
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    });
  } catch (error) {
    if (error instanceof BrevoError) {
      throw new EmailDeliveryError(
        getBrevoErrorMessage(error),
        error.statusCode
      );
    }

    throw error;
  }
}
export async function sendVerificationEmail({
  email,
  verificationLink,
}: {
  email: string;
  verificationLink: string;
}) {
const brevo = getBrevoClient();

try {return await brevo.transactionalEmails.sendTransacEmail({
  sender: {
    name: process.env.BREVO_SENDER_NAME || "ProofMe",
    email: process.env.BREVO_SENDER_EMAIL || "el.ucheee@gmail.com",
  },
  to: [{ email }],
  subject: "Verify your ProofMe account",
  htmlContent: `
    <h2>Verify your email address</h2>

    <p>
      Thank you for creating a ProofMe account.
    </p>

    <p>
      Please click the button below to verify your email address before logging in.
    </p>

    <p>
      <a href="${verificationLink}">
        Verify Email
      </a>
    </p>

    <p>
      This verification link expires in 1 hour.
    </p>
  `,
});

} catch (error) {
  if (error instanceof BrevoError) {
    throw new EmailDeliveryError(
      getBrevoErrorMessage(error),
      error.statusCode
    );
  }

  throw error;
}
}
