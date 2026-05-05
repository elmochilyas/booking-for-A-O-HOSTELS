<?php

namespace App\ValueObjects;

readonly class DateRange
{
    public function __construct(
        public readonly \DateTime $startDate,
        public readonly \DateTime $endDate,
    ) {}

    public function nights(): int
    {
        return $this->startDate->diff($this->endDate)->days;
    }

    public function contains(\DateTime $date): bool
    {
        return $date >= $this->startDate && $date < $this->endDate;
    }

    public function overlaps(self $other): bool
    {
        return $this->startDate < $other->endDate && $this->endDate > $other->startDate;
    }

    public function isSameDay(): bool
    {
        return $this->startDate->format('Y-m-d') === $this->endDate->format('Y-m-d');
    }

    public function toArray(): array
    {
        return [
            'start_date' => $this->startDate->format('Y-m-d'),
            'end_date'   => $this->endDate->format('Y-m-d'),
            'nights'     => $this->nights(),
        ];
    }

    public static function fromStrings(string $startDate, string $endDate): self
    {
        return new self(
            startDate: new \DateTime($startDate),
            endDate: new \DateTime($endDate),
        );
    }
}
