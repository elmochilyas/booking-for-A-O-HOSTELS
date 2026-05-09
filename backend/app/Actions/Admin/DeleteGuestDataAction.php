<?php

declare(strict_types=1);

namespace App\Actions\Admin;

use App\Contracts\Repositories\GuestRepositoryInterface;
use Illuminate\Support\Facades\DB;

readonly class DeleteGuestDataAction
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository,
    ) {}

    public function handle(string $guestId): void
    {
        $guest = $this->guestRepository->findOrFail($guestId);

        DB::transaction(function () use ($guest): void {
            $this->guestRepository->update($guest, [
                'first_name' => 'Deleted',
                'last_name' => 'User',
                'email' => 'deleted_'.$guest->id.'@deleted.invalid',
                'phone' => null,
                'date_of_birth' => null,
                'nationality' => null,
                'address' => null,
            ]);
        });
    }
}
