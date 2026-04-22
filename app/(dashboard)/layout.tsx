import type { Metadata } from "next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import LinksWithUserRole from "@/components/dashboard/LinksWithUserRole";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: {
        template: "Dashboard | %s",
        default: "Dashboard"
    },
    description: "This is the dasboard",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    
    
    return (
        <div className="flex min-h-screen">
            <Suspense fallback={<Skeleton className="min-h-screen w-[350px]"></Skeleton>}>
                <LinksWithUserRole />
            </Suspense>
            <Suspense fallback={<Skeleton className="w-full h-10"></Skeleton>}>
                <div className="grow p-3">
                    <DashboardHeader></DashboardHeader>
                    {children}
                    <Toaster position="bottom-right" expand={true} richColors={true}></Toaster>
                </div>
            </Suspense>
        </div>
    );
}
