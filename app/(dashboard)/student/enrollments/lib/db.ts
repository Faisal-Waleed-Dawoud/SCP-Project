"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAX_ROWS } from "@/lib/types"
import mysql from "mysql2/promise"
import { authorizeDbCallWithUserId } from "@/lib/db/calls"
import { getStudentId } from "../../courses/lib/db"
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

const getEnrollmentRequestsCache = async(userId: string, query?: string, pageNumber?: number) => {
    "use cache"
    cacheTag("enrollments")

    let offset = 0;

    if (pageNumber) {
        offset = --pageNumber * MAX_ROWS;
    }

    const studentId = await getStudentId(userId)

    try {
        if (query) {
            const [result] = await pool.query(`
                SELECT 
                partner_uni_name, location, course_name, course_code, grade, 
                DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date,
                status
                FROM enrollments 
                WHERE partner_uni_name LIKE CONCAT('%', ? , '%')
                OR location LIKE CONCAT('%', ? , '%')
                OR course_name LIKE CONCAT('%', ? , '%')
                OR course_code LIKE CONCAT('%', ? , '%')
                OR status LIKE CONCAT('%', ? , '%')
                OR grade LIKE CONCAT('%', ? , '%')
                OR enrollment_date LIKE CONCAT('%', ? , '%')
                OR finishing_date LIKE CONCAT('%', ? , '%') 
                AND student_id = ?
                LIMIT ? OFFSET ?`, [query, query, query, query, query, query, query, query, studentId, MAX_ROWS, offset])
                return result
        } else {
            const [result] = await pool.query(`
                SELECT 
                partner_uni_name, location, course_name, course_code, grade, 
                DATE_FORMAT(finishing_date, '%y-%m-%d') AS finishing_date,
                DATE_FORMAT(enrollment_date, '%y-%m-%d') AS enrollment_date,
                status
                FROM enrollments 
                WHERE student_id = ?
                LIMIT ? OFFSET ?`, [studentId, MAX_ROWS, offset])
                return result
        } 
    } catch(error) {
        return error
    }
}

export const getEnrollmentRequests = async(query?: string, pageNumber?: number) => {
    return await authorizeDbCallWithUserId("course:read", getEnrollmentRequestsCache, query, pageNumber)
}

const getEnrollmentRequestsCountCache = async(userId: string, query?: string) => {
    "use cache"
    cacheTag("enrollments")
    const studentId = await getStudentId(userId)

    try {
        if (query) {
            const [count] = await pool.query(`
                SELECT COUNT(*)
                FROM enrollments 
                WHERE partner_uni_name LIKE CONCAT('%', ? , '%')
                OR location LIKE CONCAT('%', ? , '%')
                OR course_name LIKE CONCAT('%', ? , '%')
                OR course_code LIKE CONCAT('%', ? , '%')
                OR status LIKE CONCAT('%', ? , '%')
                OR grade LIKE CONCAT('%', ? , '%')
                OR enrollment_date LIKE CONCAT('%', ? , '%')
                OR finishing_date LIKE CONCAT('%', ? , '%') 
                AND student_id = ?`, [query, query, query, query, query, query, query, query, studentId]) as any[]
                return count[0]["COUNT(*)"]
        } else {
            const [count] = await pool.query(`SELECT COUNT(*) FROM enrollments WHERE student_id = ?`, [studentId]) as any[]
            return count[0]["COUNT(*)"]
        }
    } catch(error) {
        return error
    }
}

export const getEnrollmentRequestsCount = async(query?: string) => {
    return await authorizeDbCallWithUserId("course:read", getEnrollmentRequestsCountCache, query)
}

