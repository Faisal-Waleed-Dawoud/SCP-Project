'use client'
import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { enroll } from '../lib/actions'
import Submit from '@/components/submit'
import { EnrollmentFormErrors } from '../lib/types'
import { BaseFormState } from '@/lib/types'
import { toast } from 'sonner'


interface EnrollForm extends BaseFormState {
    errors: EnrollmentFormErrors
    status: number
}

function CourseEnroll({courseId} : {courseId: string}) {

    const initalState: EnrollForm = {
        errors: {
            gpa: "",
            level: ""
        },
        status: 0
    }

    const enrollWithId = enroll.bind(null, courseId)

    const [state, action] = useActionState(enrollWithId, initalState)

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('Enrollment successful')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error(state?.errors?.gpa || state?.error || 'Unable to enroll')
        }
    }, [state])
    
    return (
        <Form action={action}>
            <Submit variant='default' text='Enroll'></Submit>
            {
            (state?.errors?.gpa) && <p className='text-red-400'>{state?.errors?.gpa}</p>}
        </Form>
    )
}

export default CourseEnroll
