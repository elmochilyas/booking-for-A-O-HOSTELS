<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>See You Tomorrow!</h1>
        </div>
        <div class="content">
            <p>Hi {{ $guest_name }},</p>
            <p>Your check-in at <strong>{{ $property_name }}</strong> is tomorrow!</p>
            <p><strong>Check-in:</strong> {{ $check_in }}</p>
            <p><strong>Address:</strong> {{ $property_address }}</p>
            <p>Check-in time is from 3:00 PM.</p>
            <p>See you soon!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} A&O Hostels.</p>
        </div>
    </div>
</body>
</html>