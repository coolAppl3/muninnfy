import { emailTransporter } from './initTransporter';
import accountVerificationEmailTemplate, { AccountVerificationEmailTemplate } from './emailTemplates/accountVerificationEmailTemplate';
import emailUpdateStartEmailTemplate, { EmailUpdateStartEmailTemplate } from './emailTemplates/emailChangeStartEmailTemplate';
import accountRecoveryEmailTemplate, { AccountRecoveryEmailTemplate } from './emailTemplates/accountRecoveryEmailTemplate';
import accountDeletionEmailTemplate, { AccountDeletionEmailTemplate } from './emailTemplates/accountDeletionEmailTemplate';

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

export async function sendEmailUpdateStartEmailService(payload: { receiver: string } & EmailUpdateStartEmailTemplate): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Email Change',
    html: emailUpdateStartEmailTemplate({ ...rest }),
  });
}

export async function sendAccountRecoveryEmailService(payload: { receiver: string } & AccountRecoveryEmailTemplate): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Account Recovery',
    html: accountRecoveryEmailTemplate({ ...rest }),
  });
}

export async function sendAccountDeletionEmailService(payload: { receiver: string } & AccountDeletionEmailTemplate): Promise<void> {
  const { receiver, ...rest } = payload;

  await sendEmailService({
    receiver,
    subject: 'Muninnfy - Account Deletion',
    html: accountDeletionEmailTemplate({ ...rest }),
  });
}
