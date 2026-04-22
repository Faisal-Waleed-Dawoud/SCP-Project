/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { revalidatePath } from "next/cache"
import { gradeSet } from "./db"

export async function setGrade(studentId:number, courseId:string, prevState: any, formData:FormData) {
    const grade = formData.get("grade") as string
    try {
        await gradeSet(studentId, courseId, grade)
        revalidatePath("partner_university/students")
        return { status: 200 }
    } catch(error) {
        return { status: 500, error: error instanceof Error ? error.message : String(error) }
    }
}