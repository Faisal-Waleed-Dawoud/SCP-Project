'use client'

import Submit from '@/components/submit'
import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { approveEnrollment } from '../lib/actions'
import { toast } from 'sonner'

function EnrollmentAccept({courseId, studentId} : {courseId:string, studentId: number}) {
    const [state, action] = useActionState(approveEnrollment.bind(null, courseId, studentId), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Enrollment accepted successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error(state?.error || 'Unable to accept enrollment')
        }
    }, [state])

    return (
        <>
            <Form action={action}>
                <Submit text='Accept' variant='default'></Submit>
            </Form>
        </>
    )
}

export default EnrollmentAccept
