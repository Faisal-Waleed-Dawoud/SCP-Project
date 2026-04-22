/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { authorizeDbCallWithUserId } from "@/lib/db/calls"
import { authorize } from "@/lib/db/users"
import { MAX_ROWS } from "@/lib/types"
import { formatDate, getCurrentUser } from "@/lib/utils"
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

const getEnrolledStudentsCache = async (userId:string, query?: string, pageNumber?: number) => {
    "use cache"
    cacheTag("enrollments")
    let offset = 0;
    if (pageNumber) {
        offset = --pageNumber * MAX_ROWS;
    }
    try {
        const [uniId] = await pool.query(`SELECT partner_uni_id FROM partner_uni_admission WHERE user_id = ?`, [userId]) as any[]

        if (query) {
            const [enrollments] = await pool.query(`
                    SELECT s.student_id, CONCAT(u.firstName, ' ', u.lastName) AS student_name, e.course_id, DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date, DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date, grade, course_name, course_code FROM enrolled_courses e 
                    JOIN courses c 
                    ON e.course_id = c.course_id AND partner_uni_id = ? AND status = "approved"
                    JOIN student s ON s.student_id = e.student_id
                    JOIN user u ON u.id = s.user_id
                    WHERE s.student_id LIKE CONCAT('%', ? , '%')
                    OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                    OR grade LIKE CONCAT('%', ? , '%')
                    OR course_name LIKE CONCAT('%', ? , '%')
                    OR course_code LIKE CONCAT('%', ?, '%')
                    LIMIT ? OFFSET ?`, [uniId[0].partner_uni_id, query, query, query, query, query, MAX_ROWS, offset])

                return enrollments
            } else {
                const [enrollments] = await (pool).query(`
                    SELECT s.student_id, CONCAT(u.firstName, ' ', u.lastName) AS student_name, e.course_id, grade, DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date, DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date, course_name, course_code FROM enrolled_courses e 
                    JOIN courses c 
                    ON e.course_id = c.course_id AND partner_uni_id = ? AND status = "approved"
                    JOIN student s ON s.student_id = e.student_id
                    JOIN user u ON u.id = s.user_id
                    LIMIT ? OFFSET ?
                    `, [uniId[0].partner_uni_id, MAX_ROWS, offset])
            return enrollments;
        }

    } catch (error) {
        return error;
    }
}

export const getEnrolledStudents = async(query?:string, pageNumber?:number) => {
    return await authorizeDbCallWithUserId("enrollment:read", getEnrolledStudentsCache, query, pageNumber)
}

const getEnrollmentsCountCache = async (userId:string, query?: string) => {
    "use cache"
    cacheTag("enrollments")
    try {
        const [uniId] = await pool.query(`SELECT partner_uni_id FROM partner_uni_admission WHERE user_id = ?`, [userId]) as any[]

        if (query) {
            const [count] = await pool.query(`
                SELECT COUNT(*) FROM enrolled_courses e 
                JOIN courses c 
                ON e.course_id = c.course_id AND partner_uni_id = ? AND status = "approved"
                JOIN student s ON s.student_id = e.student_id
                JOIN user u ON u.id = s.user_id
                WHERE s.student_id LIKE CONCAT('%', ? , '%')
                OR CONCAT(u.firstName, ' ', u.lastName) LIKE CONCAT('%', ? , '%')
                OR grade LIKE CONCAT('%', ? , '%')
                OR course_name LIKE CONCAT('%', ? , '%')
                OR course_code LIKE CONCAT('%', ?, '%')
                `, [uniId[0].partner_uni_id, query, query, query, query, query]) as any[]
            return count[0]["COUNT(*)"]
        }
        const [count] = await pool.query(`
            SELECT COUNT(*) FROM enrolled_courses e 
            JOIN courses c 
            ON e.course_id = c.course_id AND partner_uni_id = ? AND status = "approved"
            `, [uniId[0].partner_uni_id]) as any[]
        return count[0]["COUNT(*)"]
    } catch(error) {
        return error
    }
}

export const getEnrollmentsCount = async(query?:string) => {
    return await authorizeDbCallWithUserId("enrollment:read", getEnrollmentsCountCache, query)
}


export const gradeSet = async(studentId: number, courseId: string, grade: string) => {
    const user = await getCurrentUser({fullUser: false, redirectIfNotFound:true})
    const isAuthorized = await authorize(user.role, "enrollment:completed")
    if (!isAuthorized) {
        return
    }
    const date = Date.now();
    const finishing_date = formatDate(date)
    try {
        await pool.query(`
            UPDATE enrolled_courses
            SET status = "completed",
            grade = ?,
            finishing_date = ?
            WHERE student_id = ?
            AND course_id = ?
            `,
            [grade, finishing_date, studentId, courseId]
        )
        updateTag("enrollments")
    } catch(error) {
        return error
    }
}