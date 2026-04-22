'use client'

import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { courseStopProvide } from '../lib/actions'
import Submit from '@/components/submit'
import { toast } from 'sonner'

function CourseStopProvide({courseId} : {courseId:string}) {
    const [state, action] = useActionState(courseStopProvide.bind(null, courseId), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Course stopped successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error('Unable to stop course')
        }
    }, [state])

    return (
        <>
            <Form action={action}>
                <Submit text='Stop Providing' variant='destructive'></Submit>
            </Form>
        </>
    )
}

export default CourseStopProvide
