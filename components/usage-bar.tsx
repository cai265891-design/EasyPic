'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Coins } from 'lucide-react';

interface UsageBarProps {
  credits: number;
  maxCredits: number;
  projectsThisMonth: number;
}

export function UsageBar({ credits, maxCredits, projectsThisMonth }: UsageBarProps) {
  const percentage = (credits / maxCredits) * 100;
  const possibleProjects = Math.floor(credits / 10); // 10 credits per project

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Credits</span>
        </div>
        <span className="text-sm font-bold">
          {credits} / {maxCredits}
        </span>
      </div>

      <Progress value={percentage} className="mb-3 h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{possibleProjects} projects available</span>
        <span>{projectsThisMonth} used this month</span>
      </div>
    </Card>
  );
}
