import { ACCOUNT_VERIFICATION_WINDOW, minuteMilliseconds } from '../../constants';

interface AccountVerificationEmailTemplate {
  displayName: string;
  verificationToken: string;
}

export default function accountVerificationEmailTemplate({ displayName, verificationToken }: AccountVerificationEmailTemplate): string {
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
            <a href="https://muninnfy.com/verification/sign-up?verificationToken=${verificationToken}"
              >https://muninnfy.com/verification/sign-up?verificationToken=${verificationToken}</a
            >.
          </p>

          <p>Your account will be automatically deleted if it's not verified within ${
            ACCOUNT_VERIFICATION_WINDOW / minuteMilliseconds
          } minutes of being created.</p>
          <p>If this request wasn't made by you, feel free to ignore it.</p>

          <p">Warmest regards,</p>
          <p>Muninnfy</p>
        </div>
      </body>
    </html>
  `;
}
