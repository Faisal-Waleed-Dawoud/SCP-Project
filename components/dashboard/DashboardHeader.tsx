import React from 'react'
import Profile from './Profile'
import ProfileData from './ProfileData'
import { getCurrentUser } from '@/lib/utils'



async function DashboardHeader() {

    const user = await getCurrentUser({fullUser: false, redirectIfNotFound: true})
    
    return (
        <div className='flex justify-end p-3'>
            <Profile>
                <ProfileData id={user.userId}></ProfileData>
            </Profile>
        </div>
    )
}

export default DashboardHeader
