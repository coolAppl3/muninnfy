import { emailTransporter } from './initTransporter';
import accountVerificationEmailTemplate from './emailTemplates/accountVerificationEmailTemplate';

interface SendAccountVerificationEmailConfig {
  receiver: string;
  displayName: string;
  accountId: number;
  verificationToken: string;
  expiryTimestamp: number;
}

export async function sendAccountVerificationEmail(config: SendAccountVerificationEmailConfig): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: `Muninnfy <${process.env.TRANSPORTER_USER}>`,
      to: config.receiver,
      subject: 'Muninnfy - Account Verification',
      html: accountVerificationEmailTemplate({ displayName: config.displayName, verificationToken: config.verificationToken }),
    });
  } catch (err: unknown) {
    console.log(err);
  }
}
