export function createEmailVerificationTemplate(link: string): string {
  const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
       <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
        .button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border-radius: 8px;
        }
    </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Fahoot!</h1>
            <p>Thank you for signing up. Please verify your email address by clicking the link below.</p>
            <a href="{{LINK}}" class="button">Verify Email</a>
            <p>If the above link doesn't work, copy and paste the following URL into your browser:</p>
            <a href="{{LINK}}">{{LINK}}</a>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Thanks,</p>
            <p>Fahoot</p>
        </div>
    </body>
    </html>
  `;

  return template.replace(/{{LINK}}/g, link);
}

export function createPasswordResetTemplate(link: string): string {
  const template = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
        .button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. If you made this request, please click the link below to proceed. If you did not request a password reset, please ignore this email.</p>
        <a href="{{LINK}}" class="button">Reset Password</a>
        <p>If the above link doesn't work, copy and paste the following URL into your browser:</p>
        <a href="{{LINK}}">{{LINK}}</a>
        <p>Thank you,</p>
        <p>Your Company</p>
    </div>
</body>
</html>
  `;

  return template.replace(/{{LINK}}/g, link);
}
