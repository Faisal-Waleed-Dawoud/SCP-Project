"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { EnrollmentsStatus } from "@/app/(dashboard)/admission/enrollments/lib/types"

type DataPoint = {
    course_name: string
    requests: number
    status: EnrollmentsStatus
}

const STATUSES = [EnrollmentsStatus.pending, EnrollmentsStatus.approved, EnrollmentsStatus.rejected, EnrollmentsStatus.completed]

const STATUS_LABELS: Record<DataPoint["status"], string> = {
    pending : "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
}

export default function RequestsPerCourseBarChart({ data }: { data: DataPoint[] }) {
    const [selectedStatus, setSelectedStatus] = useState<DataPoint["status"]>(EnrollmentsStatus.pending)
    const filteredData = data.filter((item) => item.status === selectedStatus)

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Requests Per Course</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {STATUSES.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 py-1.5 rounded-md text-sm border duration-300 hover:cursor-pointer ${
                                selectedStatus === status
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white hover:bg-[#eee]"
                            }`}
                        >
                            {STATUS_LABELS[status]}
                        </button>
                    ))}
                </div>

                {filteredData.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No course requests yet.</div>
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="course_name"
                                    angle={-20}
                                    textAnchor="end"
                                    interval={0}
                                    height={70}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
