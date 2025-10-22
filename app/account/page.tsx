'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CreditCard, Coins, TrendingUp } from 'lucide-react';

// Mock data (TODO: Replace with actual API calls)
const mockSubscription = {
  plan: 'Pro',
  status: 'active',
  credits: 250,
  maxCredits: 300,
  renewsAt: '2025-11-22',
};

const mockCreditHistory = [
  { id: '1', date: '2025-10-22', amount: -10, type: 'Project generation', projectName: 'Water Bottle' },
  { id: '2', date: '2025-10-20', amount: -10, type: 'Project generation', projectName: 'Wireless Earbuds' },
  { id: '3', date: '2025-10-15', amount: 300, type: 'Monthly subscription', projectName: '-' },
  { id: '4', date: '2025-10-10', amount: -20, type: 'Batch generation', projectName: '2 projects' },
];

const mockUsageStats = {
  thisMonth: { projects: 5, credits: 50 },
  lastMonth: { projects: 12, credits: 120 },
  allTime: { projects: 45, credits: 450 },
};

export default function AccountPage() {
  const handleManageSubscription = () => {
    // TODO: Redirect to Stripe customer portal
    window.open('https://billing.stripe.com/p/login/test_xxx', '_blank');
  };

  return (
    <div className="container max-w-6xl space-y-8 px-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your subscription, credits, and usage</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{mockSubscription.plan} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {mockSubscription.maxCredits} credits per month
                  </p>
                </div>
                <Badge className="bg-green-500">
                  {mockSubscription.status.charAt(0).toUpperCase() + mockSubscription.status.slice(1)}
                </Badge>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Credits Remaining</p>
                      <p className="text-sm text-muted-foreground">
                        Renews on {new Date(mockSubscription.renewsAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {mockSubscription.credits} / {mockSubscription.maxCredits}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleManageSubscription} className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Manage Subscription
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button variant="outline">Upgrade Plan</Button>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">💡 Tip</p>
                <p className="text-muted-foreground">
                  Upgrade to Agency plan to save 33% and get access to API, team features, and priority support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCreditHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-muted-foreground">{item.projectName}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.amount > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                          {item.amount > 0 ? '+' : ''}
                          {item.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Stats Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsageStats.thisMonth.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {mockUsageStats.thisMonth.credits} credits used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsageStats.lastMonth.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {mockUsageStats.lastMonth.credits} credits used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsageStats.allTime.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {mockUsageStats.allTime.credits} credits used
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">Chart placeholder (TODO: Implement with Chart.js)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
