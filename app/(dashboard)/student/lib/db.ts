/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { authorizeDbCallWithUserId } from "@/lib/db/calls"
import mysql from "mysql2/promise"
import { getStudentId } from "../courses/lib/db"

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

const getEnrollmentStatusCountsCache = async (userId: string) => {
    "use cache"

    try {
        const studentId = await getStudentId(userId)
        const [rows] = await pool.query(
            `
            SELECT status, COUNT(*) AS count
            FROM enrollments
            WHERE student_id = ?
            AND status IN ('pending', 'approved', 'rejected', 'completed')
            GROUP BY status
            `,
            [studentId]
        ) as any[]

        const base = {
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0,
        }

        for (const row of rows) {
            if (row.status === "pending") base.pending = row.count
            if (row.status === "approved") base.approved = row.count
            if (row.status === "rejected") base.rejected = row.count
            if (row.status === "completed") base.completed = row.count
        }

        return base
    } catch (error) {
        return error
    }
}

export const getEnrollmentStatusCounts = async () => {
    return await authorizeDbCallWithUserId("course:read", getEnrollmentStatusCountsCache)
}

const getCurrentEnrollmentsCache = async (userId: string, limit = 5) => {
    "use cache"

    try {
        const studentId = await getStudentId(userId)
        const [rows] = await pool.query(
            `
            SELECT
                course_name,
                course_code,
                partner_uni_name,
                status,
                DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date
            FROM enrollments
            WHERE student_id = ?
            AND status IN ('approved', 'completed')
            ORDER BY
                (enrollment_date IS NULL),
                enrollment_date DESC,
                finishing_date DESC
            LIMIT ?
            `,
            [studentId, limit]
        ) as any[]

        return rows
    } catch (error) {
        return error
    }
}

export const getCurrentEnrollments = async (limit = 5) => {
    return await authorizeDbCallWithUserId("course:read", getCurrentEnrollmentsCache, limit)
}

const getRecentActivityCache = async (userId: string, limit = 5) => {
    "use cache"

    try {
        const studentId = await getStudentId(userId)
        const [rows] = await pool.query(
            `
            SELECT
                course_name,
                course_code,
                partner_uni_name,
                status,
                DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date,
                grade
            FROM enrollments
            WHERE student_id = ?
            AND status IN ('pending', 'approved', 'rejected', 'completed')
            ORDER BY
                (enrollment_date IS NULL),
                enrollment_date DESC,
                finishing_date DESC
            LIMIT ?
            `,
            [studentId, limit]
        ) as any[]

        return rows
    } catch (error) {
        return error
    }
}

export const getRecentActivity = async (limit = 5) => {
    return await authorizeDbCallWithUserId("course:read", getRecentActivityCache, limit)
}