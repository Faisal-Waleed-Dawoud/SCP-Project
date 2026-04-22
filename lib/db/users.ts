'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import mysql from "mysql2/promise"
import { cacheTag, updateTag } from "next/cache"



// These details (host, user, etc...) should be stored in .env file and never 
// exposed in the client side
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


export const insertUser = async (firstName: string, lastName: string, email: string, password: string, salt: string, role: string) => {

    try {
        await pool.query(`
            INSERT INTO user 
            (firstName, lastName, email, password, salt, role) 
            VALUES( ? , ?, ? , ?, ?, ?)
            `, [firstName, lastName, email, password, salt, role])

        const [user] = await pool.query(`SELECT id FROM user WHERE email = ?`, [email])

        return (user as any[])[0].id
    } catch (error) {
        return error
    }
}

export const updateUser = async (userId: string, firstName: string, lastName: string, password: string, salt: string) => {
    try {
        await pool.query(`
            UPDATE user
            SET firstName = ?, 
            lastName = ?,
            password = ?,
            salt = ?
            WHERE id = ?
            `, [firstName, lastName, password, salt, userId])
            updateTag("user")
    } catch (error) {
        return error
    }
}

export const updateUserAndEmail = async (userId: string, firstName: string, lastName: string, email: string, password: string, salt: string) => {
    try {
        await pool.query(`
            UPDATE user
            SET firstName = ?, 
            lastName = ?,
            email = ?
            password = ?,
            salt = ?
            WHERE id = ?
            `, [firstName, lastName, email, password, salt, userId])
    } catch (error) {
        return error
    }
}

// This function gets the user by email to check if it already exists before signning up
export const userExists = async (email: string) => {

    try {
        const [user] = await (pool).query(`SELECT * FROM user WHERE email = ?`, [email]);

        return (user as any[])[0]
    } catch (error) {
        return error;
    }
}

// This function should return the user details 
export const getUserFromSessionToken = async (sessionToken: string) => {
    "use cache"
    try {
        const [userId] = await (pool).query("SELECT userId, role FROM session WHERE token = ?", [sessionToken])


        return (userId as any[])[0]
    } catch (error) {
        return error
    }
}

export const getUserById = async (id: string) => {
    "use cache"
    cacheTag("user")
    try {
        const [user] = await (pool).query("SELECT * FROM user WHERE id = ?", [id])
        return (user as any[])[0]
    } catch (error) {
        return error
    }
}


export const authorize = async (roleName: string, permission: string) => {
    "use cache"
    try {
        const [result] = await pool.query(`
            SELECT name , role_name from permission p 
            JOIN roles_permission rp
            ON p.id = rp.permission_id where rp.role_name = ? AND p.name = ?`, [roleName, permission])
        return (result as any[])[0]
    } catch (error) {
        return error
    }
}