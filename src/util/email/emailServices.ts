import { emailTransporter } from './initTransporter';
import accountVerificationEmailTemplate from './emailTemplates/accountVerificationEmailTemplate';

type SendAccountVerificationEmailConfig = {
  receiver: string;
  displayName: string;
  publicAccountId: string;
  verificationToken: string;
};

export async function sendAccountVerificationEmail(config: SendAccountVerificationEmailConfig): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: `Muninnfy <${process.env.TRANSPORTER_USER}>`,
      to: config.receiver,
      subject: 'Muninnfy - Account Verification',
      html: accountVerificationEmailTemplate({
        displayName: config.displayName,
        publicAccountId: config.publicAccountId,
        verificationToken: config.verificationToken,
      }),
    });
  } catch (err: unknown) {
    console.log(err);
  }
}
