"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authorizeDbCallWithUserId } from "@/lib/db/calls"
import mysql from "mysql2/promise"
import {
    PartnerRecentActivityItem,
    PartnerSummaryStats,
    RequestsPerCourseByStatusItem,
    RequestsPerCourseItem,
} from "./types"
import { cacheTag } from "next/cache"

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : undefined,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    waitForConnections: true,
    queueLimit: 0,
})

const getPartnerUniversityId = async (userId: string) => {
    const [uni] = await pool.query(
        `
        SELECT partner_uni_id
        FROM partner_uni_admission
        WHERE user_id = ?
        `,
        [userId]
    ) as any[]

    return uni[0]?.partner_uni_id
}

const getPartnerSummaryStatsCache = async (userId: string): Promise<PartnerSummaryStats> => {
    "use cache"

    const partnerUniId = await getPartnerUniversityId(userId)

    const [requestRows] = await pool.query(
        `
        SELECT e.status, COUNT(*) AS count
        FROM enrolled_courses e
        JOIN courses c ON c.course_id = e.course_id
        WHERE c.partner_uni_id = ?
        GROUP BY e.status
        `,
        [partnerUniId]
    ) as any[]

    const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    }

    for (let i = 0; i < requestRows.length; i++) {
        const status = requestRows[i].status
        const count = Number(requestRows[i].count)
        if (status === "pending") counts.pending = count
        if (status === "approved") counts.approved = count
        if (status === "rejected") counts.rejected = count
        if (status === "completed") counts.completed = count
    }

    const [enrolledRows] = await pool.query(
        `
        SELECT COUNT(DISTINCT e.student_id) AS enrolled_students
        FROM enrolled_courses e
        JOIN courses c ON c.course_id = e.course_id
        WHERE c.partner_uni_id = ?
        AND e.status IN ('approved', 'completed')
        `,
        [partnerUniId]
    ) as any[]

    const [availableCoursesRows] = await pool.query(
        `
        SELECT COUNT(*) AS available_courses
        FROM courses
        WHERE partner_uni_id = ?
        AND course_status = 'approved'
        `,
        [partnerUniId]
    ) as any[]

    const totalRequestsReceived =
        counts.pending + counts.approved + counts.rejected + counts.completed

    return {
        totalRequestsReceived,
        pendingRequests: counts.pending,
        approvedRequests: counts.approved + counts.completed,
        rejectedRequests: counts.rejected,
        completedRequests: counts.completed,
        enrolledStudents: Number(enrolledRows[0]?.enrolled_students ?? 0),
        availableCourses: Number(availableCoursesRows[0]?.available_courses ?? 0),
    }
}

export const getPartnerSummaryStats = async () => {
    return await authorizeDbCallWithUserId("enrollment:read", getPartnerSummaryStatsCache)
}

const getRequestsPerCourseCache = async (userId: string, limit = 5): Promise<RequestsPerCourseItem[]> => {
    "use cache"

    const partnerUniId = await getPartnerUniversityId(userId)

    const [rows] = await pool.query(
        `
        SELECT c.course_name, COUNT(*) AS requests
        FROM enrolled_courses e
        JOIN courses c ON c.course_id = e.course_id
        WHERE c.partner_uni_id = ?
        GROUP BY c.course_id, c.course_name
        ORDER BY requests DESC, c.course_name ASC
        LIMIT ?
        `,
        [partnerUniId, limit]
    ) as any[]

    return rows as RequestsPerCourseItem[]
}

export const getRequestsPerCourse = async (limit = 5) => {
    return await authorizeDbCallWithUserId("enrollment:read", getRequestsPerCourseCache, limit)
}

const getRequestsPerCourseByStatusCache = async (
    userId: string,
    limitPerStatus = 7
): Promise<RequestsPerCourseByStatusItem[]> => {
    "use cache"

    const partnerUniId = await getPartnerUniversityId(userId)

    const [rows] = await pool.query(
        `
        SELECT grouped.course_name, grouped.requests, grouped.status
        FROM (
            SELECT
                c.course_name,
                COUNT(*) AS requests,
                e.status,
                ROW_NUMBER() OVER (
                    PARTITION BY e.status
                    ORDER BY COUNT(*) DESC, c.course_name ASC
                ) AS rn
            FROM enrolled_courses e
            JOIN courses c ON c.course_id = e.course_id
            WHERE c.partner_uni_id = ?
            AND e.status IN ('pending', 'approved', 'rejected', 'completed')
            GROUP BY c.course_name, e.status
        ) grouped
        WHERE grouped.rn <= ?
        ORDER BY grouped.status, grouped.requests DESC, grouped.course_name ASC
        `,
        [partnerUniId, limitPerStatus]
    ) as any[]

    return rows as RequestsPerCourseByStatusItem[]
}

export const getRequestsPerCourseByStatus = async (limitPerStatus = 7) => {
    return await authorizeDbCallWithUserId(
        "enrollment:read",
        getRequestsPerCourseByStatusCache,
        limitPerStatus
    )
}


const getPartnerRecentActivityCache = async (
    userId: string,
    limit = 6
): Promise<PartnerRecentActivityItem[]> => {
    "use cache"
    cacheTag("enrollments")
    const partnerUniId = await getPartnerUniversityId(userId)
    
    const [rows] = await pool.query(
        `
        SELECT
        e.student_id,
        CONCAT(u.firstName, ' ', u.lastName) AS student_name,
        c.course_name,
        c.course_code,
        e.status,
        DATE_FORMAT(
        GREATEST(
        COALESCE(e.enrollment_date, '1000-01-01'),
        COALESCE(e.finishing_date, '1000-01-01')), '%y-%m-%d') as last_updated,
        e.grade
        FROM enrolled_courses e
        JOIN courses c ON c.course_id = e.course_id
        JOIN student s ON s.student_id = e.student_id
        JOIN user u ON u.id = s.user_id
        WHERE c.partner_uni_id = ?
        ORDER BY
        last_updated DESC
        LIMIT ?
        `,
        [partnerUniId, limit]
    ) as any[]
    
    return rows as PartnerRecentActivityItem[]
}

export const getPartnerRecentActivity = async (limit = 6) => {
    return await authorizeDbCallWithUserId("enrollment:read", getPartnerRecentActivityCache, limit)
}
