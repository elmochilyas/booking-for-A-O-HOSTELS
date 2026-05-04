<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company { font-size: 24px; font-weight: bold; color: #0066CC; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 18px; font-weight: bold; }
        .guest-info, .property-info { margin-bottom: 20px; }
        .guest-info h3, .property-info h3 { font-size: 14px; margin-bottom: 10px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .totals { text-align: right; }
        .totals table { width: 300px; margin-left: auto; }
        .total-row { font-weight: bold; font-size: 16px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company">A&O Hostels</div>
            <div class="invoice-info">
                <div class="invoice-number">Invoice {{ $invoice_number }}</div>
                <div>Issue Date: {{ $issue_date }}</div>
                <div>Due Date: {{ $due_date }}</div>
            </div>
        </div>

        <div class="guest-info">
            <h3>Guest Details</h3>
            <p>{{ $guest->first_name }} {{ $guest->last_name }}</p>
            <p>{{ $guest->email }}</p>
            @if($guest->phone)
            <p>{{ $guest->phone }}</p>
            @endif
        </div>

        <div class="property-info">
            <h3>Property Details</h3>
            <p><strong>{{ $property->name }}</strong></p>
            <p>{{ $property->location }}</p>
            <p>{{ $property->address }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Guests</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $room_type->name }}</td>
                    <td>{{ $booking->check_in_date }}</td>
                    <td>{{ $booking->check_out_date }}</td>
                    <td>{{ $booking->guest_count }}</td>
                    <td>€{{ number_format($booking->total_price, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Total Amount:</td>
                    <td>€{{ number_format($booking->total_price, 2) }}</td>
                </tr>
                <tr>
                    <td>Paid:</td>
                    <td>€{{ number_format($payments->sum('amount'), 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Balance Due:</td>
                    <td>€{{ number_format($booking->total_price - $payments->sum('amount'), 2) }}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>A&O Hostels - Your Trusted Hostel Partner</p>
            <p>Thank you for choosing A&O!</p>
        </div>
    </div>
</body>
</html>