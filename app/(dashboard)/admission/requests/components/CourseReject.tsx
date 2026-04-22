'use client'

import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { courseReject } from '../lib/actions'
import Submit from '@/components/submit'
import { toast } from 'sonner'

function CourseReject({courseId} : {courseId:string}) {
    const [state, action] = useActionState(courseReject.bind(null, courseId), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Course rejected successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error('Unable to reject course')
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

export default CourseReject
