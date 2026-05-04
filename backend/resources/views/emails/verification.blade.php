<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>A&O Hostels</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email</h2>
            <p>Hi {{ $name }},</p>
            <p>Thank you for registering with A&O Hostels. Please verify your email address to activate your account.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $verificationUrl }}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{ $verificationUrl }}</p>
            <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} A&O Hostels. All rights reserved.</p>
        </div>
    </div>
</body>
</html>