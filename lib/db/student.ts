/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
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

export const insertStudent = async(studentId: number, gpa: number | null, level: number | null, userId: string) => {
    try {
        await pool.query(`
            INSERT INTO student VALUES(?, ?, ?, ?)
            `, [studentId, gpa, level, userId])
    } catch(error) {
        return error
    }
} 

export const updateStudent = async(userId: string, gpa: number, level: number) => {
    try {
        await pool.query(`
            UPDATE student
            SET gpa = ?,
            level = ?
            WHERE user_id = ?
            `, [gpa, level, userId])
            updateTag("student")
    } catch(error) {
        return error
    }
}

export const getStudentById = async(userId: string) => {
    "use cache"
    cacheTag("user")
    try {
        const [user] = await pool.query(`
            SELECT * FROM student WHERE user_id = ?
            `, [userId]) as  any[]
            return user[0]
    } catch(error) {
        return error
    }
} 