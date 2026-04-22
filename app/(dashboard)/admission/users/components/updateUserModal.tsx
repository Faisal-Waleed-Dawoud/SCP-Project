'use client'

import Modal from '@/components/modal'
import React, { useActionState, useEffect } from 'react'
import { BaseFormState, PartnerUni, Student, User } from '@/lib/types'
import UpdateUserForm from '@/components/dashboard/UpdateUserForm';
import { updateUserAction } from '../lib/actions';
import { CreateUserErrors } from '../lib/types';
import { toast } from 'sonner'

export interface UpdateUser extends BaseFormState<CreateUserErrors> {
    state: number
}

function UpdateUserModal({ handleOpen, user, student, partnerUni }: { handleOpen: () => void, user: User, student?: Student, partnerUni?: PartnerUni }) {

        const initalState: UpdateUser = {
            errors: {
                role: '',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                unknownError: ''
            },
            payload: undefined,
            state: 0
        };
        const action = updateUserAction.bind(null, user.id)
        const [state, formAction] = useActionState(action, initalState);

        useEffect(() => {
            if (state?.state === 200) {
                toast.success('User updated successfully')
            }
            if (state?.state === 400 || state?.state === 401 || state?.state === 500) {
                toast.error(state?.errors?.unknownError || 'Unable to update user')
            }
        }, [state])

    return (
        <>
            <Modal title='Update User' handleOpen={handleOpen}>
                
                <UpdateUserForm formAction={formAction}
                state={state} 
                user={user} 
                isAdmin={true} 
                student={student}
                partnerUni={partnerUni}>
                </UpdateUserForm>
            </Modal>
        </>
    )
}

export default UpdateUserModal
