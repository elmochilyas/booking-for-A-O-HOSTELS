<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; text-align: center; }
        .button { display: inline-block; background: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>How Was Your Stay?</h1>
        </div>
        <div class="content">
            <p>Hi {{ $guest_name }},</p>
            <p>Thank you for staying at <strong>{{ $property_name }}</strong>!</p>
            <p>We'd love to hear about your experience.</p>
            <a href="{{ $review_url }}" class="button">Leave a Review</a>
            <p>Your feedback helps us improve!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} A&O Hostels.</p>
        </div>
    </div>
</body>
</html>