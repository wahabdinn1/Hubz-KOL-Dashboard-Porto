import { Skeleton, SkeletonAvatar } from "@/components/retroui/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-8 w-[300px]" />
          <Skeleton variant="text" className="h-4 w-[250px]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px] hidden sm:block" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton variant="text" className="h-4 w-[100px]" />
              </CardTitle>
              <SkeletonAvatar size="sm" />
            </CardHeader>
            <CardContent>
              <Skeleton variant="text" className="h-8 w-[60px] mb-2" />
              <Skeleton variant="text" className="h-3 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <Skeleton variant="text" className="h-6 w-[200px]" />
                <Skeleton variant="text" className="h-4 w-[150px]" />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <Skeleton className="h-[350px] w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-3">
                <Skeleton variant="text" className="h-5 w-[150px] mb-2" />
                <Skeleton variant="text" className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 4 rows to match: Campaigns, Views, Revenue, Avg CPV */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                         <Skeleton variant="text" className="h-4 w-[100px]" />
                         <div className="flex gap-8">
                             <Skeleton variant="text" className="h-4 w-[60px]" />
                             <Skeleton variant="text" className="h-4 w-[60px]" />
                         </div>
                    </div>
                ))}
            </CardContent>
        </Card>
        
        {/* Pie Chart */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <CardHeader className="pb-2">
                <Skeleton variant="text" className="h-5 w-[150px] mb-2" />
                <Skeleton variant="text" className="h-4 w-[100px]" />
            </CardHeader>
             <CardContent>
                <Skeleton variant="circular" className="h-[200px] w-[200px] mx-auto" />
                <div className="flex justify-center gap-6 mt-4">
                    <Skeleton variant="text" className="h-4 w-[80px]" />
                    <Skeleton variant="text" className="h-4 w-[80px]" />
                </div>
            </CardContent>
        </Card>
        
         {/* Category Chart */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <CardHeader className="pb-2">
                <Skeleton variant="text" className="h-5 w-[180px] mb-2" />
                <Skeleton variant="text" className="h-4 w-[120px]" />
            </CardHeader>
             <CardContent>
                <Skeleton className="h-[220px] w-full" />
            </CardContent>
        </Card>

        {/* Top KOLs */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <CardHeader className="pb-2">
                <Skeleton variant="text" className="h-5 w-[120px] mb-2" />
                <Skeleton variant="text" className="h-4 w-[150px]" />
            </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   {Array.from({length: 5}).map((_, i) => (
                       <div key={i} className="flex justify-between items-center">
                           <div className="flex gap-2 items-center">
                               <SkeletonAvatar size="sm" />
                               <div className="space-y-1">
                                   <Skeleton variant="text" className="h-4 w-[100px]" />
                                   <Skeleton variant="text" className="h-3 w-[60px]" />
                               </div>
                           </div>
                           <Skeleton variant="text" className="h-4 w-[50px]" />
                       </div>
                   ))}
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
