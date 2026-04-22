import { EnrollmentsStatus } from "../../admission/enrollments/lib/types"

export interface PartnerSummaryStats {
    totalRequestsReceived: number
    pendingRequests: number
    approvedRequests: number
    rejectedRequests: number
    completedRequests: number
    enrolledStudents: number
    availableCourses: number
}

export interface RequestStatusBreakdown {
    approved: number
    pending: number
    rejected: number
}

export interface RequestsPerCourseItem {
    course_name: string
    requests: number
}

export interface RequestsPerCourseByStatusItem {
    course_name: string
    requests: number
    status: EnrollmentsStatus
}

export interface PartnerRecentActivityItem {
    student_id: number
    student_name: string
    course_name: string
    course_code: string
    status: string
    last_updated?: string
    grade: string
}
