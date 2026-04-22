import { getPartnerUni } from '@/lib/db/partner';
import { getStudentById } from '@/lib/db/student';
import { getUserById } from '@/lib/db/users'
import { PartnerUni, Roles, Student, User } from '@/lib/types'
import React from 'react'
import UpdateUser from './updateUser';


async function UpdateUserServer({id} : {id: string}) {

    const user = await getUserById(id) as User

    let student;
    let partnerUni;
    if (user.role === Roles.Student) {
        student = await getStudentById(user.id) as Student
    } else if (user.role === Roles.Partner_University_Admissions) {
        partnerUni = await getPartnerUni(user.id) as PartnerUni
    }

    return (
        <>
            <UpdateUser user={user} student={student} partnerUni={partnerUni}></UpdateUser>
        </>
    )
}

export default UpdateUserServer
