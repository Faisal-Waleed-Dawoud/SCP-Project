import React from 'react'
import Links from './links'
import { getCurrentUser } from '@/lib/utils'



async function LinksWithUserRole() {

    const user = await getCurrentUser({fullUser: false, redirectIfNotFound: true})
    return (
        <Links role={user.role}></Links>
    )
}

export default LinksWithUserRole
