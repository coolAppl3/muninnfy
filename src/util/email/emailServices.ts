import { emailTransporter } from './initTransporter';
import accountVerificationEmailTemplate from './emailTemplates/accountVerificationEmailTemplate';

type SendEmailService = {
  receiver: string;
  subject: string;
  html: string;
};

async function sendEmailService({ receiver, subject, html }: SendEmailService): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: `Muninnfy <${process.env.TRANSPORTER_USER}>`,
      to: receiver,
      subject,
      html,
    });
  } catch (err: unknown) {
    console.log(err);
  }
}

type SendAccountVerificationEmailServicePayload = {
  receiver: string;
  displayName: string;
  publicAccountId: string;
  verificationToken: string;
};

export async function sendAccountVerificationEmailService(payload: SendAccountVerificationEmailServicePayload): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Account Verification',
    html: accountVerificationEmailTemplate({ ...rest }),
  });
}
