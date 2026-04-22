import { EnrollmentRequests } from "../enrollments/lib/types"

export interface EnrollmentStatusCounts {
    pending: number
    approved: number
    rejected: number
    completed: number
}

export type CurrentEnrollment = Omit<EnrollmentRequests, "location" | "grade">

export type RecentActivityItem = Omit<EnrollmentRequests, "location">