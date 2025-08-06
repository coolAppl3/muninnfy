import { emailTransporter } from './initTransporter';

interface SendAccountVerificationEmailConfig {
  receiver: string;
  displayName: string;
  accountId: number;
  verificationToken: string;
  expiryTimestamp: number;
}

export async function sendAccountVerificationEmail(config: SendAccountVerificationEmailConfig): Promise<void> {
  try {
    // TODO: continue implementation
  } catch (err: unknown) {
    console.log(err);
  }
}
