<?php

namespace App\Actions\Admin;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Review;
use Illuminate\Support\Facades\DB;

readonly class MergeGuestsAction
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository,
    ) {}

    public function handle(string $sourceId, string $targetId): Guest
    {
        return DB::transaction(function () use ($sourceId, $targetId) {
            $source = $this->guestRepository->findOrFail($sourceId);
            $target = $this->guestRepository->findOrFail($targetId);

            Booking::where('guest_id', $sourceId)->update(['guest_id' => $targetId]);
            Review::where('guest_id', $sourceId)->update(['guest_id' => $targetId]);

            $this->guestRepository->delete($source);

            return $target;
        });
    }
}
