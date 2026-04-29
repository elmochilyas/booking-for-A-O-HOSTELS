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
            <h1>Welcome to A&O Hostels!</h1>
        </div>
        <div class="content">
            <h2>Hi {{ $name }},</h2>
            <p>Your email has been verified successfully!</p>
            <p>You now have access to:</p>
            <ul>
                <li>Book stays at all A&O locations</li>
                <li>Join A&O Club for 25% discount</li>
                <li>Earn loyalty points on every booking</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $loginUrl }}" class="button">Start Booking</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} A&O Hostels. All rights reserved.</p>
        </div>
    </div>
</body>
</html>