"use client"
import Submit from '@/components/submit'
import { useRouter } from 'next/navigation'
import React from 'react'



function Generatexlsx({apiURL, query, status, fileName, count} : {apiURL: string, query?:string, status?: string, fileName: string, count: number}) {

    
    let seachParams = ""
    if (query && status) {
        seachParams = `?query=${query}&status=${status}`
    } else if (query) {
        seachParams = `?query=${query}`
    } else if (status) {
        seachParams = `?status=${status}`
    }

    const router = useRouter()


    const handleSubmit = async() => {
        if (count === 0) {
            router.push(window.location.pathname)
            return
        }
        const res = await fetch(`${apiURL}${seachParams}`, {
            method: "POST",
        })

        if (res.ok) {
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        }
        
    }

    return (
        <form action={handleSubmit}>
            <Submit variant='default' text="Generate xlsx File"></Submit>
        </form>
    )
}

export default Generatexlsx
