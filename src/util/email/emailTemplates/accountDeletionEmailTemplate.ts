export type AccountDeletionEmailTemplate = {
  displayName: string;
  confirmationCode: string;
};

export default function accountDeletionEmailTemplate({ displayName, confirmationCode }: AccountDeletionEmailTemplate): string {
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

           <p>We received a request to delete your account. To confirm this action, please use the following confirmation code: ${confirmationCode}.</p>

          <p>
            If you didn't make this request, please sign in and change your password to ensure any unauthorized access is removed. Otherwise, we
            wish you all the best moving forward!
          </p>

          <p>Warmest regards,</p>
          <p>Muninnfy</p>
        </div>
      </body>
    </html>

  `;
}
