import { emailTransporter } from './initTransporter';
import accountVerificationEmailTemplate, { AccountVerificationEmailTemplate } from './emailTemplates/accountVerificationEmailTemplate';
import emailChangeStartEmailTemplate, { EmailUpdateStartEmailTemplate } from './emailTemplates/emailChangeStartEmailTemplate';

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

export async function sendAccountVerificationEmailService(payload: { receiver: string } & AccountVerificationEmailTemplate): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Account Verification',
    html: accountVerificationEmailTemplate({ ...rest }),
  });
}

export async function sendEmailChangeStartEmailService(payload: { receiver: string } & EmailUpdateStartEmailTemplate): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Email Update',
    html: emailChangeStartEmailTemplate({ ...rest }),
  });
}
