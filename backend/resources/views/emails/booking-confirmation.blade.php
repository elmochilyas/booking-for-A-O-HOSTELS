<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066CC; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .details { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #22C55E; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
            <p>Hi {{ $guest_name }},</p>
            <p>Your booking at A&O Hostels has been confirmed!</p>
            
            <div class="details">
                <div class="details-row"><span>Booking ID:</span><strong>{{ $booking_id }}</strong></div>
                <div class="details-row"><span>Property:</span><strong>{{ $property_name }}</strong></div>
                <div class="details-row"><span>Address:</span><span>{{ $property_address }}</span></div>
                <div class="details-row"><span>Room Type:</span><span>{{ $room_type }}</span></div>
                <div class="details-row"><span>Check-in:</span><strong>{{ $check_in }}</strong></div>
                <div class="details-row"><span>Check-out:</span><strong>{{ $check_out }}</strong></div>
                <div class="details-row"><span>Total Price:</span><span class="total">€{{ number_format($total_price, 2) }}</span></div>
                <div class="details-row"><span>Payment:</span><span>{{ $payment_status }}</span></div>
            </div>
            
            <p>We look forward to seeing you!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} A&O Hostels. All rights reserved.</p>
        </div>
    </div>
</body>
</html>