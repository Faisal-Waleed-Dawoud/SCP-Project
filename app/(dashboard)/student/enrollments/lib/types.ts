import { EnrollmentsStatus } from "../../courses/lib/types"


export interface EnrollmentRequests {
    course_name: string,
    course_code: string,
    location: string,
    partner_uni_name: string,
    grade: string,
    enrollment_date: string
    finishing_date: string,
    status: EnrollmentsStatus
}
