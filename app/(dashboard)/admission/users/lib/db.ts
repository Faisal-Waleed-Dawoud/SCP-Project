"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authorizeDbCall } from "@/lib/db/calls"
import { authorize } from "@/lib/db/users"
import { MAX_ROWS } from "@/lib/types"
import { getCurrentUser } from "@/lib/utils"
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

const getUsersCache = async (query?: string, pageNumber?:number) => {
    "use cache"
    
    let offset = 0;
    if (pageNumber) {
        offset = --pageNumber * MAX_ROWS;
    }
    try {
        if (query) {
            const [users] = await pool.query(`
                SELECT * FROM user WHERE 
                firstName LIKE CONCAT('%', ? , '%')
                OR lastName LIKE CONCAT('%', ? , '%')
                OR email LIKE CONCAT('%', ? , '%')
                OR role LIKE CONCAT('%', ? , '%')
                LIMIT ? OFFSET ?`, [query, query, query, query, MAX_ROWS, offset])
                
                return users
        } else {
            const [users] = await (pool).query("SELECT * FROM user LIMIT ? OFFSET ?", [MAX_ROWS, offset])
            
            return users;
        }

    } catch (error) {
        return error;
    }
}

const getAllUsersCache = async(query?:string) => {
    "use cache"
    try {
        if (query) {
            const [users] = await pool.query(`
                SELECT firstName, lastName, email, role FROM user WHERE 
                firstName LIKE CONCAT('%', ? , '%')
                OR lastName LIKE CONCAT('%', ? , '%')
                OR email LIKE CONCAT('%', ? , '%')
                OR role LIKE CONCAT('%', ? , '%')
                `, [query, query, query, query])
                
                return users
        } else {
            const [users] = await (pool).query("SELECT firstName, lastName, email, role FROM user")
            
            return users;
        }

    } catch (error) {
        return error;
    }
}

export const getAllUsers = async(query?:string) => {
    return await authorizeDbCall("user:read", getAllUsersCache, query)
}

export const getUsers = async(query?:string, pageNumber?: number) => {
    return await authorizeDbCall("user:read", getUsersCache, query, pageNumber)
}

export const deleteUser = async(id: string) => {
    
    const user = await getCurrentUser({fullUser: false, redirectIfNotFound: true})
    if (!user) {
        return
    }

    const isAuthorized = await authorize(user.role, "user:delete")
    if (isAuthorized === undefined) {
        return
    }

    try {
        await pool.query("DELETE FROM user WHERE id = ?", [id])
    } catch(error) {
        return error
    }
}

const getUsersCountCache = async(query?:string, ) => {
    "use cache"
    try {
        if (query) {
            const [count] = await pool.query(`
                SELECT COUNT(*) FROM user WHERE 
                firstName LIKE CONCAT('%', ? , '%')
                OR lastName LIKE CONCAT('%', ? , '%')
                OR email LIKE CONCAT('%', ? , '%')
                OR role LIKE CONCAT('%', ? , '%')`, [query, query, query, query]) as any[]
            return count[0]["COUNT(*)"]
        }
        const [count] = await pool.query("SELECT COUNT(*) FROM user") as any[]
        return count[0]["COUNT(*)"]
    } catch(error) {
        return error
    }
}

export const getUsersCount = async(query?:string) => {
    return await authorizeDbCall("user:read", getUsersCountCache, query)
}