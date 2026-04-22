'use client'

import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { courseAccept } from '../lib/actions'
import Submit from '@/components/submit'
import { toast } from 'sonner'

function CourseAccept({courseId} : {courseId:string}) {
    const [state, action] = useActionState(courseAccept.bind(null, courseId), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Course accepted successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error('Unable to accept course')
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

export default CourseAccept
