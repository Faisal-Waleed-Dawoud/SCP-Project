import React from "react"
import StudentRequestStatusPieChart from "@/components/dashboard/StudentRequestStatusPieChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentEnrollments, getEnrollmentStatusCounts, getRecentActivity } from "./lib/db"
import type { CurrentEnrollment, EnrollmentStatusCounts, RecentActivityItem } from "./lib/types"
import Table from "@/components/dashboard/Table"


function getActivityMessage(item: RecentActivityItem) {
    const course = item.course_name

    switch (item.status) {
        case "pending":
            return `Your request for "${course}" is under review.`
        case "approved":
            return `Your request for "${course}" was approved.`
        case "rejected":
            return `Your request for "${course}" was rejected.`
        case "completed":
            return `Enrollment for "${course}" was completed.`
        default:
            return `Your request for "${course}" was updated.`
    }
}

export default async function Page() {
    const statusCounts = await getEnrollmentStatusCounts() as EnrollmentStatusCounts

    const currentEnrollments = await getCurrentEnrollments(5) as CurrentEnrollment[]

    const recentActivity = await getRecentActivity(5) as RecentActivityItem[]

    const enrollmentRows = []

    for (let i = 0; i < currentEnrollments.length; i++) {
        currentEnrollments[i]

        enrollmentRows.push(
            <tr
                key={`${currentEnrollments[i].course_code}-${i}`}
                className="hover:bg-[#eee] duration-300 border-b-2 border-b-gray-100 last:border-none"
            >
                <td className="table-custom-cell">{currentEnrollments[i].course_name}</td>
                <td className="table-custom-cell">{currentEnrollments[i].partner_uni_name}</td>
                <td className="table-custom-cell">
                    {currentEnrollments[i].enrollment_date
                        ? currentEnrollments[i].enrollment_date
                        : "TBA"}
                </td>
                <td className="table-custom-cell">
                    {currentEnrollments[i].finishing_date
                        ? currentEnrollments[i].finishing_date
                        : "TBA"}
                </td>
                <td className="table-custom-cell">
                    <span
                        className={`px-2 py-1 rounded-lg ${
                            currentEnrollments[i].status === "completed"
                                ? "bg-green-500 text-white"
                                : "bg-green-200 text-blue-900"
                        }`}
                    >
                        {currentEnrollments[i].status}
                    </span>
                </td>
            </tr>
        )
    }

    const requestedCourses = statusCounts.pending + statusCounts.approved + statusCounts.rejected + statusCounts.completed

    const approvedRequests = statusCounts.approved + statusCounts.completed
    const pendingRequests = statusCounts.pending
    const rejectedRequests = statusCounts.rejected

    return (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-4 gap-4">
                <Card className="p-4 border shadow-custom rounded-md">
                    <CardTitle className="text-xs font-semibold text-blue-400">Requested Courses</CardTitle>
                    <div className="text-3xl font-semibold mt-2">{requestedCourses}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total enrollment requests</div>
                </Card>

                <Card className="p-4 border shadow-custom rounded-md">
                    <CardTitle className="text-xs font-semibold text-blue-400">Approved Requests</CardTitle>
                    <div className="text-3xl font-semibold mt-2">{approvedRequests}</div>
                    <div className="text-sm text-muted-foreground mt-1">Approved (and completed)</div>
                </Card>

                <Card className="p-4 border shadow-custom rounded-md">
                    <CardTitle className="text-xs font-semibold text-blue-400">Pending Requests</CardTitle>
                    <div className="text-3xl font-semibold mt-2">{pendingRequests}</div>
                    <div className="text-sm text-muted-foreground mt-1">Waiting for review</div>
                </Card>

                <Card className="p-4 border shadow-custom rounded-md sm:col-span-1">
                    <CardTitle className="text-xs font-semibold text-blue-400">Current Enrollments</CardTitle>
                    <div className="text-3xl font-semibold mt-2">{approvedRequests}</div>
                    <div className="text-sm text-muted-foreground mt-1">Approved (and completed)</div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <StudentRequestStatusPieChart
                        approved={approvedRequests}
                        pending={pendingRequests}
                        rejected={rejectedRequests}
                    />

                    <Table className="border shadow-custom rounded-md">
                        <Table.Header className="mb-3 flex">
                            <Table.Title className="text-lg font-semibold" text="Current Enrollments" />
                        </Table.Header>

                        {currentEnrollments.length === 0 ? (
                            <div className="text-sm text-muted-foreground py-6 px-3">
                                You are not enrolled in any course yet.
                            </div>
                        ) : (
                            <Table.Data pageNumber={1} pages={1} className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-b-gray-100">
                                        <td className="table-custom-cell">Course</td>
                                        <td className="table-custom-cell">Partner University</td>
                                        <td className="table-custom-cell">Enrollment Date</td>
                                        <td className="table-custom-cell">Finishing Date</td>
                                        <td className="table-custom-cell">Status</td>
                                    </tr>
                                </thead>
                                <tbody>{enrollmentRows}</tbody>
                            </Table.Data>
                        )}
                    </Table>
                </div>

                <Card className="border shadow-custom rounded-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No activity yet.</div>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {recentActivity.map((item: RecentActivityItem, idx: number) => {
                                    const date = item.enrollment_date ?? item.finishing_date
                                    
                                    return (
                                        <li key={`${item.course_code}-${idx}`} className="border rounded-md p-3">
                                            <div className="text-sm font-medium">{getActivityMessage(item)}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{date}</div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
