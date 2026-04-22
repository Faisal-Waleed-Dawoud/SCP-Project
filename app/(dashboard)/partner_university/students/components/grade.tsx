"use client"
import Submit from '@/components/submit'
import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { setGrade } from '../lib/actions'
import { toast } from 'sonner'



function Grade({studentId, courseId}: {studentId: number, courseId: string}) {

    const setGradeWithIds = setGrade.bind(null, studentId, courseId)

    const [state, action] = useActionState(setGradeWithIds, null)

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Grade saved successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error(state?.error || 'Unable to set grade')
        }
    }, [state])

    return (
        <Form action={action}>
            <select name='grade'>
                <option value={"A+"}>A+</option>
                <option value={"A"}>A</option>
                <option value={"B+"}>B+</option>
                <option value={"B"}>B</option>
                <option value={"C+"}>C+</option>
                <option value={"C"}>C</option>
                <option value={"D+"}>D+</option>
                <option value={"D"}>D</option>
                <option value={"F"}>F</option>
            </select>
            <Submit variant='default' text='Save'></Submit>
        </Form>
    )
}

export default Grade
