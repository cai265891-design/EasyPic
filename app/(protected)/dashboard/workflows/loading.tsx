import { DashboardHeader } from "@/components/dashboard/header";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import { DashboardShell } from "@/components/dashboard/shell";

export default function WorkflowsLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="工作流系统"
        text="亚马逊产品 Listing 自动化工作流"
      />
      <div className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </DashboardShell>
  );
}
