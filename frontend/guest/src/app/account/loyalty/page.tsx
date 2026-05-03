'use client'

import { Star, Gift, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { guestService, type LoyaltyInfo } from '@/services/guest.service'
import { Skeleton } from '@/components/ui/skeleton'

const tierInfo: Record<string, { name: string; color: string; next: string | null; pointsNeeded: number }> = {
  bronze: { name: 'Bronze', color: 'bg-amber-600', next: 'silver', pointsNeeded: 1000 },
  silver: { name: 'Silver', color: 'bg-gray-400', next: 'gold', pointsNeeded: 5000 },
  gold: { name: 'Gold', color: 'bg-yellow-500', next: 'platinum', pointsNeeded: 15000 },
  platinum: { name: 'Platinum', color: 'bg-purple-600', next: null, pointsNeeded: 0 },
}

const benefits = [
  { icon: Star, title: '25% Off Every Stay', description: 'Always get 25% off the best available rate' },
  { icon: Gift, title: 'Secret Deals', description: 'Access exclusive member-only offers' },
  { icon: Clock, title: 'Priority Booking', description: 'Get early access to new properties' },
  { icon: TrendingUp, title: 'Earn Points', description: 'Earn 10 points for every euro spent' },
]

export default function LoyaltyPage() {
  const { data: loyalty, isLoading } = useQuery<LoyaltyInfo>({
    queryKey: ['loyalty'],
    queryFn: () => guestService.getLoyalty(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const tier = loyalty?.tier || 'bronze'
  const currentTier = tierInfo[tier]
  const nextTier = tierInfo[currentTier.next as keyof typeof tierInfo]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">A&O Club</h1>
        <p className="text-muted-foreground">Your loyalty program dashboard</p>
      </div>

      {/* Membership Card */}
      <Card className={`${currentTier.color} text-white`}>
        <CardContent className="p-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80">Membership Status</p>
              <h2 className="text-3xl font-bold mt-1">{currentTier.name} Member</h2>
              <p className="text-white/80 mt-2">Member since {loyalty?.memberSince || '2024'}</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{loyalty?.points || 0}</p>
              <p className="text-white/80">Points Balance</p>
            </div>
          </div>

          {nextTier && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{nextTier.name}</span>
                <span>{nextTier.pointsNeeded - (loyalty?.points || 0)} points to go</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${((loyalty?.points || 0) / nextTier.pointsNeeded) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Your Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          {loyalty?.history && loyalty.history.length > 0 ? (
            <div className="space-y-4">
              {loyalty.history.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={transaction.type === 'earned' ? 'success' : transaction.type === 'redeemed' ? 'secondary' : 'outline'}>
                    {transaction.type === 'earned' ? '+' : transaction.type === 'redeemed' ? '-' : ''}
                    {transaction.points}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No points history yet</p>
          )}
        </CardContent>
      </Card>

      {/* Redeem Points */}
      <Card>
        <CardHeader>
          <CardTitle>Redeem Your Points</CardTitle>
          <CardDescription>Convert your points into rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">1,000</p>
              <p className="text-muted-foreground">points</p>
              <p className="font-semibold text-primary mt-2">€10 Discount</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">5,000</p>
              <p className="text-muted-foreground">points</p>
              <p className="font-semibold text-primary mt-2">€50 Discount</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-2xl font-bold">10,000</p>
              <p className="text-muted-foreground">points</p>
              <p className="font-semibold text-primary mt-2">Free Night</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}