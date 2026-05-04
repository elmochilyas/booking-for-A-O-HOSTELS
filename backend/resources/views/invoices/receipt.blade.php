<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company { font-size: 24px; font-weight: bold; color: #0066CC; }
        .receipt-number { font-size: 18px; font-weight: bold; margin-top: 10px; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        .amount { font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; color: #22C55E; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company">A&O Hostels</div>
            <div class="receipt-number">Receipt {{ $receipt_number }}</div>
        </div>

        <div class="info">
            <p><strong>Date:</strong> {{ $issue_date }}</p>
            <p><strong>Guest:</strong> {{ $guest->first_name }} {{ $guest->last_name }}</p>
            <p><strong>Property:</strong> {{ $property->name }}</p>
            <p><strong>Booking ID:</strong> {{ $payment->booking_id }}</p>
            <p><strong>Payment Method:</strong> {{ $payment->payment_method }}</p>
        </div>

        <div class="amount">
            €{{ number_format($payment->amount, 2) }}
        </div>

        <div class="info">
            <p><strong>Status:</strong> {{ ucfirst($payment->status) }}</p>
            <p><strong>Transaction ID:</strong> {{ $payment->stripe_payment_id }}</p>
        </div>

        <div class="footer">
            <p>Thank you for your payment!</p>
            <p>A&O Hostels</p>
        </div>
    </div>
</body>
</html>