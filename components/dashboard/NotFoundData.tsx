'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Frown } from 'lucide-react'

interface NotFoundDataProps {
    message?: string
}

function NotFoundData({ message = "No data found" }: NotFoundDataProps) {
    const router = useRouter()

    const handleReset = () => {
        router.push(window.location.pathname)
    }

    return (
        <>
            <div className='flex flex-col items-center justify-center py-12 px-4'>
                <Frown width={40} height={40}></Frown>
                <p className='text-lg font-semibold text-gray-700 mb-4'>{message}</p>
                <Button
                    onClick={handleReset}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors'
                >
                    Refresh
                </Button>
            </div>
        </>
    )
}

export default NotFoundData
