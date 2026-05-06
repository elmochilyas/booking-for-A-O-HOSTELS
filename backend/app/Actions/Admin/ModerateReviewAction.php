<?php

namespace App\Actions\Admin;

use App\Models\AuditLog;
use App\Models\Review;

readonly class ModerateReviewAction
{
    public function handle(string $reviewId, array $data): Review
    {
        $review = Review::findOrFail($reviewId);
        $review->update([
            'status' => $data['status'],
            'reply' => $data['reply'] ?? null,
        ]);

        AuditLog::log('review_moderated', 'review', $reviewId, null, $data);

        return $review;
    }
}
