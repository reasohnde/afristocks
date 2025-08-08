// backend/src/templates/email.ts
export const EmailTemplate = {
  welcome: (user: any) => ({
    subject: 'Bienvenue sur AfriStocks !',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(to right, #f97316, #fbbf24); padding: 40px; text-align: center; }
            .content { padding: 40px; }
            .button { display: inline-block; padding: 15px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Bienvenue sur AfriStocks</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.name},</h2>
              <p>Nous sommes ravis de vous accueillir sur AfriStocks, la plateforme d'investissement #1 en Afrique.</p>
              
              <h3>Prochaines étapes :</h3>
              <ul>
                <li>Complétez votre profil</li>
                <li>Vérifiez votre identité (KYC)</li>
                <li>Effectuez votre premier dépôt</li>
                <li>Explorez les startups disponibles</li>
              </ul>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://afristocks.com/dashboard" class="button">
                  Accéder à mon compte
                </a>
              </div>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe AfriStocks</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Bienvenue ${user.name} sur AfriStocks...`
  }),
  
  investmentConfirmation: (investment: any) => ({
    // Template similaire
  })
};