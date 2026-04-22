import React from "react"
import StudentRequestStatusPieChart from "@/components/dashboard/StudentRequestStatusPieChart"
import RequestsPerCourseBarChart from "@/components/dashboard/RequestsPerCourseBarChart"
import {
    getPartnerRecentActivity,
    getPartnerSummaryStats,
    getRequestsPerCourseByStatus,
} from "./lib/db"
import {
    PartnerRecentActivityItem,
    PartnerSummaryStats,
    RequestsPerCourseByStatusItem,
} from "./lib/types"
import Card from "@/components/Card"
import Image from "next/image"
import { ArchiveIcon, CircleQuestionMarkIcon, SearchCheckIcon } from "lucide-react"


function getActivityMessage(item: PartnerRecentActivityItem) {
    const courseLabel = `${item.course_name} (${item.course_code})`

    if (item.status === "pending") {
        return `New request received for "${courseLabel}" from ${item.student_name}.`
    }
    if (item.status === "approved") {
        return `Course request for "${courseLabel}" from ${item.student_name} was approved.`
    }
    if (item.status === "rejected") {
        return `Course request for "${courseLabel}" from ${item.student_name} was rejected.`
    }
    if (item.status === "completed") {
        return `Student ${item.student_name} completed "${courseLabel} with ${item.grade}".`
    }
    return `Request for "${courseLabel}" was updated.`
}

export default async function Page() {
    const summary = await getPartnerSummaryStats() as PartnerSummaryStats
    const requestsPerCourse = await getRequestsPerCourseByStatus(7) as RequestsPerCourseByStatusItem[]
    const recentActivity = await getPartnerRecentActivity(6) as PartnerRecentActivityItem[]
    
    return (
        <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-4 border shadow-custom flex flex-col gap-2 items-center rounded-md">
                    <Card.Title className="text-xs font-semibold text-blue-400">
                        Total Requests Received
                    </Card.Title>
                    <div className="flex items-center gap-2">
                        <ArchiveIcon width={40} height={40}></ArchiveIcon>
                        <Card.Data className="text-3xl font-semibold">
                            {summary.totalRequestsReceived}
                        </Card.Data>
                    </div>
                </Card>
                <Card className="p-4 border shadow-custom flex flex-col gap-2 items-center rounded-md">
                    <Card.Title className="text-xs font-semibold text-blue-400">
                        Pending Requests
                    </Card.Title>
                    <div className="flex items-center gap-2">
                        <CircleQuestionMarkIcon width={40} height={40}></CircleQuestionMarkIcon>
                        <Card.Data className="text-3xl font-semibold">
                            {summary.pendingRequests}
                        </Card.Data>
                    </div>
                </Card>
                <Card className="p-4 border shadow-custom flex flex-col gap-2 items-center rounded-md">
                    <Card.Title className="text-xs font-semibold text-blue-400">
                        Approved Requests
                    </Card.Title>
                    <div className="flex items-center gap-2">
                        <SearchCheckIcon width={40} height={40}></SearchCheckIcon>
                        <Card.Data className="text-3xl font-semibold">
                            {summary.approvedRequests}
                        </Card.Data>
                    </div>
                </Card>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-4 border shadow-custom flex flex-col gap-2 items-center rounded-md">
                    <Card.Title className="text-xs font-semibold text-blue-400">
                        Enrolled Students
                    </Card.Title>
                    <div className="flex items-center gap-2">
                        <Card.Icon>
                            <Image src="/reading.png" alt='student' width={40} height={40}></Image>
                        </Card.Icon>
                        <Card.Data className="text-3xl font-semibold">
                            {summary.enrolledStudents}
                        </Card.Data>
                    </div>
                </Card>
                <Card className="p-4 border shadow-custom flex flex-col gap-2 items-center rounded-md">
                    <Card.Title className="text-xs font-semibold text-blue-400">
                        Available Courses
                    </Card.Title>
                    <div className="flex items-center gap-2">
                        <Card.Icon>
                            <Image src="/course.png" alt='course' width={40} height={40}></Image>
                        </Card.Icon>
                        <Card.Data className="text-3xl font-semibold">
                            {summary.availableCourses}
                        </Card.Data>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <StudentRequestStatusPieChart
                    approved={summary.approvedRequests}
                    pending={summary.pendingRequests}
                    rejected={summary.rejectedRequests}
                />
                <RequestsPerCourseBarChart data={requestsPerCourse} />
            </div>

            <Card className="border shadow-custom rounded-md p-4">
                <Card.Title className="text-base pb-2 px-3 font-semibold">Recent Activity</Card.Title>
                <Card.Data>
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No activity yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {recentActivity.map((item, idx) => {
                                return (
                                    <li key={`${item.student_id}-${item.course_name}-${idx}`} className="border rounded-md p-3">
                                        <p className="text-sm font-medium">{getActivityMessage(item)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{item.last_updated !== "00-01-01" ? item.last_updated : "Rejected"}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </Card.Data>
            </Card>
        </div>
    )
}
