"use server"
import { authorizeDbCall } from "@/lib/db/calls"
import mysql from "mysql2/promise"

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

const getStudentNumberCache = async () => {
    "use cache"

    try {
        const [rows] = await pool.query("SELECT COUNT(*) FROM student")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (rows as any[])[0]["COUNT(*)"]
    } catch (error) {
        return error
    }

}

export const getStudentNumber = async () => {
    return await authorizeDbCall("user:read", getStudentNumberCache)
}

const getPartnersNumberCache = async () => {
    "use cache"

    try {
        const [rows] = await pool.query("SELECT COUNT(*) FROM partner_uni_admission")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (rows as any[])[0]["COUNT(*)"]
    } catch (error) {
        return error
    }

}

export const getPartnersNumber = async () => {
    return await authorizeDbCall("user:read", getPartnersNumberCache)
}

const getApprovedCoursesNumberCache = async () => {
    "use cache"

    try {
        const [rows] = await pool.query(`SELECT COUNT(*) FROM courses 
                WHERE course_status = "approved"`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (rows as any[])[0]["COUNT(*)"]
    } catch (error) {
        return error
    }
}

export const getApprovedCoursesNumber = async () => {
    return await authorizeDbCall("course:read", getApprovedCoursesNumberCache)
}

const getUniversitiesAndCoursesNumberCache = async () => {
    "use cache"

    try {
        const [rows] = await pool.query(`
            SELECT partner_uni_name AS uni_name, Count(partner_uni_name) AS courses_number from partner_uni_admission p JOIN
            courses c ON
            p.partner_uni_id = c.partner_uni_id AND c.course_status = "approved"
            GROUP BY partner_uni_name;`)
        return rows
    } catch (error) {
        return error
    }
}

export const getUniversitiesAndCoursesNumber = async () => {
    return await authorizeDbCall("course:read", getUniversitiesAndCoursesNumberCache)
}

const mostRegisteredCoursesCache = async () => {
    "use cache"

    try {
        const [rows] = await pool.query(`
            SELECT course_name, course_code, partner_uni_name, COUNT(partner_uni_name) AS enrolled_students from courses c 
            JOIN enrolled_courses en
            ON c.course_id = en.course_id and status = "approved"
            JOIN partner_uni_admission p 
            ON c.partner_uni_id = p.partner_uni_id
            GROUP BY c.course_id
            ORDER BY enrolled_students DESC
            LIMIT 5;`)

        return rows
    } catch (error) {
        return error
    }
}

export const mostRegisteredCourses = async () => {
    return await authorizeDbCall("course:read", mostRegisteredCoursesCache)
}