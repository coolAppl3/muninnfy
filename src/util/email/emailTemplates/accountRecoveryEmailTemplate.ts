export type AccountRecoveryEmailTemplate = {
  displayName: string;
  publicAccountId: string;
  recoveryToken: string;
};

export default function accountRecoveryEmailTemplate({
  displayName,
  publicAccountId,
  recoveryToken,
}: AccountRecoveryEmailTemplate): string {
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
              We received a request to recover your account. To continue, please click the following link:
              <a href="${origin}/sign-up/verification?publicAccountId=${publicAccountId}&recoveryToken=${recoveryToken}"
                >${origin}/sign-up/verification?publicAccountId=${publicAccountId}&recoveryToken=${recoveryToken}</a
              >.
            </p>
  
            <p>If this request wasn't made by you, make sure your inbox is secured then feel free to ignore this email.</p>
  
            <p>Warmest regards,</p>
            <p>Muninnfy</p>
          </div>
        </body>
      </html>
    `;
}
