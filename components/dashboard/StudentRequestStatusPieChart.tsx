"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

type Props = {
    approved: number
    pending: number
    rejected: number
}

const COLORS = {
    approved: "#22c55e",
    pending: "#f59e0b",
    rejected: "#ef4444",
} as const

export default function StudentRequestStatusPieChart({ approved, pending, rejected }: Props) {
    const data = [
        { name: "Approved", value: approved, color: COLORS.approved },
        { name: "Pending", value: pending, color: COLORS.pending },
        { name: "Rejected", value: rejected, color: COLORS.rejected },
    ]
    const hasAny = approved + pending + rejected > 0

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Request Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                {!hasAny ? (
                    <div className="text-sm text-muted-foreground">No requests yet.</div>
                ) : (
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip />
                                <Legend />
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={45}
                                    outerRadius={80}
                                    stroke="none"
                                    isAnimationActive={true}
                                    
                                >
                                    {data.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

