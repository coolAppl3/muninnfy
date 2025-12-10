export type AccountDeletionEmailTemplate = {
  displayName: string;
  publicAccountId: string;
  deletionToken: string;
};

export default function accountDeletionEmailTemplate({
  displayName,
  publicAccountId,
  deletionToken,
}: AccountDeletionEmailTemplate): string {
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
      </head>

      <body>
        <div style="background-color: #181b13; padding: 20px; color: #cbcbcd; font-family: sans-serif; font-weight: 500">
          <p>Hey ${displayName},</p>

          <p>
            We received a request to delete your account. To continue, please click the following link:
            <a href="${origin}/sign-up/verification?publicAccountId=${publicAccountId}&deletionToken=${deletionToken}"
              >${origin}/sign-up/verification?publicAccountId=${publicAccountId}&deletionToken=${deletionToken}</a
            >.
          </p>

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
