import { minuteMilliseconds } from '../../constants/globalConstants';
import { ACCOUNT_VERIFICATION_WINDOW } from '../../constants/accountConstants';

type AccountVerificationEmailTemplate = {
  displayName: string;
  publicAccountId: string;
  verificationToken: string;
};

export default function accountVerificationEmailTemplate({
  displayName,
  publicAccountId,
  verificationToken,
}: AccountVerificationEmailTemplate): string {
  const origin: string = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://muninnfy.com';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Email</title>
      </head>
      
      <body>
        <div style="background-color: #181b13; padding: 20px; color: #cbcbcd; font-family: sans-serif; font-weight: 500">
          <p>Hey ${displayName},</p>
          <p>Welcome to Muninnfy!</p>

          <p>
            To verify your account, please click the following link:
            <a href="${origin}/sign-up/verification?publicAccountId=${publicAccountId}&verificationToken=${verificationToken}"
              >${origin}/sign-up/verification?publicAccountId=${publicAccountId}&verificationToken=${verificationToken}</a
            >.
          </p>

          <p>Your account will be automatically deleted if it's not verified within ${Math.floor(
            ACCOUNT_VERIFICATION_WINDOW / minuteMilliseconds
          )} minutes of being created.</p>
          <p>If this request wasn't made by you, feel free to ignore it.</p>

          <p">Warmest regards,</p>
          <p>Muninnfy</p>
        </div>
      </body>
    </html>
  `;
}
