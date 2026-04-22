'use client'

import Modal from '@/components/modal'
import Submit from '@/components/submit'
import Form from 'next/form'
import React, { useActionState, useEffect } from 'react'
import { deleteUserAction } from '../lib/actions'
import { toast } from 'sonner'


function DeleteUserModal({ handleOpen, id }: { handleOpen: () => void, id:string }) {
    const [state, action] = useActionState(deleteUserAction.bind(null, id), { status: 0 })

    useEffect(() => {
        if (state?.status === 200) {
            toast.success('User deleted successfully')
        }
        if (state?.status === 400 || state?.status === 401 || state?.status === 500) {
            toast.error(state?.error || 'Unable to delete user')
        }
    }, [state])

    return (
        <>
            <Modal title='Delete User' handleOpen={handleOpen}>
                <Form action={action} className='grid gap-2'>
                    <p className='text-gray-500 text-sm'>Are you sure you want to delete the user?</p>
                    <Submit variant='destructive' text='Delete User'></Submit>
                </Form>
            </Modal>
        </>
    )
}

export default DeleteUserModal
