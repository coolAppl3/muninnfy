export type EmailUpdateStartEmailTemplate = {
  displayName: string;
  confirmationCode: string;
};

export default function emailChangeStartEmailTemplate({ displayName, confirmationCode }: EmailUpdateStartEmailTemplate): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </head>
      
      <body>
        <div style="background-color: #181b13; padding: 20px; color: #cbcbcd; font-family: sans-serif; font-weight: 500">
          <p>Hey ${displayName},</p>

          <p>We received a request to update the email address on your account. To confirm this change, please use the following verification code: ${confirmationCode}.</p>

          <p>If you didn't make this request, please sign in and change your password to ensure any unauthorized access is removed.</p>

          <p">Warmest regards,</p>
          <p>Muninnfy</p>
        </div>
      </body>
    </html>
  `;
}
