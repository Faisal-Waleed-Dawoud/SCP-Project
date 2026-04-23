"use server"

import { authorizeDbCall } from "@/lib/db/calls"
import { MAX_ROWS, Status } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import mysql from "mysql2/promise"
import { cacheTag, updateTag } from "next/cache"

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

const getEnrollmentsCache = async (query?: string, status?: string, pageNumber?: number) => {
    "use cache"
    cacheTag("enrollments")
    let offset = 0;
    if (pageNumber) {
        offset = --pageNumber * MAX_ROWS;
    }
    try {
        if (query && status) {
            const [courses] = await pool.query(`
                SELECT e.*,
                DATE_FORMAT(e.finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(e.enrollment_date, '%y-%m-%d') AS enrollment_date,
                CONCAT(u.firstName, ' ', u.lastName) AS student_name
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE (
                e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%'))
                AND e.status = ?
                LIMIT ? OFFSET ?`, [query, query, query, query, query, query, status, MAX_ROWS, offset])

            return courses
        } else if (query) {
            const [courses] = await pool.query(`
                SELECT e.*,
                DATE_FORMAT(e.finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(e.enrollment_date, '%y-%m-%d') AS enrollment_date,
                CONCAT(u.firstName, ' ', u.lastName) AS student_name
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%')
                LIMIT ? OFFSET ?`, [query, query, query, query, query, query, MAX_ROWS, offset])

            return courses
        } else if (status) {
            const [courses] = await pool.query(`
                SELECT e.*,
                DATE_FORMAT(e.finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(e.enrollment_date, '%y-%m-%d') AS enrollment_date,
                CONCAT(u.firstName, ' ', u.lastName) AS student_name
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE e.status = ?
                LIMIT ? OFFSET ?`, [status, MAX_ROWS, offset])

            return courses
        } else {
            const [courses] = await (pool).query(`
                SELECT e.*,
                DATE_FORMAT(e.finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(e.enrollment_date, '%y-%m-%d') AS enrollment_date,
                CONCAT(u.firstName, ' ', u.lastName) AS student_name
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                LIMIT ? OFFSET ?`, [MAX_ROWS, offset])
            return courses;
        }

    } catch (error) {
        return error;
    }
}

export const getEnrollments = async (query?: string, status?: string, pageNumber?: number) => {
    return await authorizeDbCall("course:read", getEnrollmentsCache, query, status, pageNumber)
}

export const getEnrollmentsCountCache = async (query?: string, status?: string) => {
    "use cache"
    cacheTag("enrollments")
    try {
        if (query && status) {
            const [count] = await pool.query(`
                SELECT COUNT(*) FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE (e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%'))
                AND e.status = ?`, [query, query, query, query, query, query, status])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (count as any)[0]["COUNT(*)"]
        } else if (query) {
            const [count] = await pool.query(`
                SELECT COUNT(*) FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%')`, [query, query, query, query, query, query])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (count as any)[0]["COUNT(*)"]
        } else if (status) {
            const [count] = await pool.query(`
                SELECT COUNT(*) FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE e.status = ?`, [status])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (count as any)[0]["COUNT(*)"]
        }
        const [count] = await pool.query(`
            SELECT COUNT(*) FROM enrollments e
            JOIN student s ON s.student_id = e.student_id
            JOIN user u ON u.id = s.user_id
            `)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (count as any)[0]["COUNT(*)"]
    } catch (error) {
        return error
    }
}

export const getEnrollmentsCount = async (query?: string, status?: string) => {
    return await authorizeDbCall("course:read", getEnrollmentsCountCache, query, status)
}

// For the API
const getAllEnrollmentsCache = async (query?: string, status?: string) => {
    "use cache"
    cacheTag("enrollments")
    const selectedColumns = `
    e.student_id,
    CONCAT(u.firstName, ' ', u.lastName) AS student_name,
    e.grade,
    e.enrollment_date,
    e.finishing_date,
    e.status,
    e.course_name,
    e.course_code,
    e.location
    `
    
    try {
        if (query && status) {
            const [enrollments] = await pool.query(`
                SELECT ${selectedColumns}
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE (e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%'))
                AND e.status = ?`, [query, query, query, query, query, query, status])
                return enrollments
        } else if (query) {
            const [enrollments] = await pool.query(`
                SELECT ${selectedColumns}
                FROM enrollments e
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE e.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR e.location LIKE CONCAT('%', ? , '%')
                OR e.course_name LIKE CONCAT('%', ? , '%')
                OR e.course_code LIKE CONCAT('%', ? , '%')
                OR e.partner_uni_name LIKE CONCAT('%', ? , '%')`, [query, query, query, query, query, query])
                
                return enrollments
            } else if (status) {
                const [enrollments] = await pool.query(`
                    SELECT ${selectedColumns}
                    FROM enrollments e
                    JOIN student s ON s.student_id = e.student_id
                    JOIN user u ON u.id = s.user_id
                    WHERE e.status = ?`, [status])
                    
                    return enrollments;
                } else {
                    const [enrollments] = await pool.query(`
                        SELECT ${selectedColumns}
                        FROM enrollments e
                        JOIN student s ON s.student_id = e.student_id
                        JOIN user u ON u.id = s.user_id
                        `)
                        
                        return enrollments;
                    }
                    
                } catch (error) {
                    return error;
                }
            }
            
            export const getAllEnrollments = async (query?: string, status?: string) => {
                return await authorizeDbCall("course:read", getAllEnrollmentsCache, query, status)
            }

// For the API

export const enrollmentApprove = async (courseId: string, studentId: number, admissionId: string) => {
    const date = Date.now()
    const enrollmentDate = formatDate(date)
    try {
        await pool.query(`
            UPDATE enrolled_courses
            SET status = ?,
            admission_id = ?,
            enrollment_date = ?
            WHERE course_id = ?
            AND student_id = ?
            `, [Status.approved, admissionId, enrollmentDate, courseId, studentId])
            updateTag("enrollments")
        } catch (error) {
            return error
        }
    }

    export const enrollmentReject = async (courseId: string, studentId: number, admissionId: string) => {
        try {
            await pool.query(`
                UPDATE enrolled_courses
                SET status = ?,
                admission_id = ?
                WHERE course_id = ? 
                AND student_id = ?
                `, [Status.rejected, admissionId, courseId, studentId])
                updateTag("enrollments")
            } catch (error) {
                return error
            }
        }