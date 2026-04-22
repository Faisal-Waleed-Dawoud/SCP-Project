'use client'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import UpdateUserModal from './updateUserModal'
import { PartnerUni, Student, User } from '@/lib/types'


function UpdateUser({
    user,
    student,
    partnerUni,
}: {
    user: User;
    student?: Student;
    partnerUni?: PartnerUni;
}) {

        const [open, setOpen] = useState(false)
    
        function handleOpen() {
            setOpen(!open)
        }

    return (
        <>
        <Button variant="outline" onClick={handleOpen} >Update User</Button>
        {open && <UpdateUserModal user={user} student={student} partnerUni={partnerUni} handleOpen={handleOpen}>
            </UpdateUserModal>}
        </>
    )
}

export default UpdateUser
