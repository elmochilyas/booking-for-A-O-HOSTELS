<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case CARD = 'card';
    case CASH = 'cash';
    case WALLET = 'wallet';
    case BANK_TRANSFER = 'bank_transfer';
    case STRIPE = 'stripe';

    public function label(): string
    {
        return match ($this) {
            self::CARD => 'Credit / Debit Card',
            self::CASH => 'Cash',
            self::WALLET => 'Digital Wallet',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::STRIPE => 'Stripe',
        };
    }

    public function requiresOnlineProcessing(): bool
    {
        return in_array($this, [self::CARD, self::STRIPE]);
    }
}
