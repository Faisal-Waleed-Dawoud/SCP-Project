'use client'

import Submit from '@/components/submit'
import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { rejectEnrollment } from '../lib/actions'
import { toast } from 'sonner'

function EnrollmentReject({courseId, studentId}: {courseId: string, studentId: number}) {
    const [state, action] = useActionState(rejectEnrollment.bind(null, courseId, studentId), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Enrollment rejected successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error(state?.error || 'Unable to reject enrollment')
        }
    }, [state])

    return (
        <>
            <Form action={action}>
                <Submit text='Reject' variant='destructive'></Submit>
            </Form>
        </>
    )
}

export default EnrollmentReject
