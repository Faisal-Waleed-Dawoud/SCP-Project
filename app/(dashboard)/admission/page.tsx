import Card from '@/components/Card'
import { University } from 'lucide-react'
import React from 'react'
import { getApprovedCoursesNumber, getPartnersNumber, getStudentNumber, getUniversitiesAndCoursesNumber, mostRegisteredCourses } from './lib/db'
import Image from 'next/image'
import Piechart from '@/components/dashboard/piechart'
import {  mostEnrolledCourses, UniversitiesCoursesNumber } from './lib/types'
import Table from '@/components/dashboard/Table'
import NotFoundData from '@/components/dashboard/NotFoundData'

async function Page() {

    const studentNumber = await getStudentNumber() as number
    const partnerUniNumber = await getPartnersNumber() as number
    const approvedCoursesNumber = await getApprovedCoursesNumber() as number
    const uniCourses = await getUniversitiesAndCoursesNumber() as UniversitiesCoursesNumber[]
    const registeredCourses = await mostRegisteredCourses() as mostEnrolledCourses[]
    const rows = []

    for (let i = 0; i < registeredCourses.length; i++) {
        rows.push(<tr key={i} className='hover:bg-[#eee] duration-300 border-b-2 h-fit border-b-gray-100 last:border-none'>
            <td className='table-custom-cell'>{registeredCourses[i].course_code}</td>
            <td className='table-custom-cell'>{registeredCourses[i].course_name}</td>
            <td className='table-custom-cell'>{registeredCourses[i].partner_uni_name}</td>
            <td className='table-custom-cell'>{registeredCourses[i].enrolled_students}</td>
        </tr>)
    }
    

    return (
        <>
        
            <div className='grid sm:grid-cols-3 gap-2'>
                <Card className='p-2 border shadow-custom flex flex-col gap-2 items-center rounded-md'>
                    <Card.Title className='text-xs font-semibold text-blue-400'>
                        Registered Students
                    </Card.Title>
                    <div className='flex items-center gap-2'>
                        <Card.Icon>
                            <Image src="/reading.png" alt='student' width={40} height={40}></Image>
                        </Card.Icon>
                        <Card.Data className='font-semibold text-4xl'>
                            {studentNumber}
                        </Card.Data>
                    </div>
                </Card>
                <Card className='p-2 border shadow-custom flex flex-col gap-2 items-center rounded-md'>
                    <Card.Title className='text-xs font-semibold text-blue-400'>
                        Partner Universities
                    </Card.Title>
                    <div className='flex items-center gap-2'>
                        <Card.Icon>
                            <University strokeWidth={1} className='h-10 w-10'></University>
                        </Card.Icon>
                        <Card.Data className='font-semibold text-4xl'>
                            {partnerUniNumber}
                        </Card.Data>
                    </div>
                </Card>
                <Card className='p-2 border shadow-custom flex flex-col gap-2 items-center rounded-md'>
                    <Card.Title className='text-xs font-semibold text-blue-400'>
                        Available Courses
                    </Card.Title>
                    <div className='flex items-center gap-2'>
                        <Card.Icon>
                            <Image src="/course.png" alt='course' width={40} height={40}></Image>
                        </Card.Icon>
                        <Card.Data className='font-semibold text-4xl'>
                            {approvedCoursesNumber}
                        </Card.Data>
                    </div>
                </Card>
                <Piechart props={uniCourses}></Piechart>
                <Table className='sm:col-span-2 py-6 overflow-y-hidden flex flex-col gap-2'>
                    <Table.Header className='flex'>
                        <Table.Title className='text-lg font-semibold' text='Most Registered Courses'></Table.Title>
                    </Table.Header>
                    {registeredCourses.length === 0 ? (<NotFoundData></NotFoundData>) : (
                    <table className='w-full h-full'>
                        <thead>
                            <tr>
                                <td className='table-custom-cell'>Course Code</td>
                                <td className='table-custom-cell'>Course Name</td>
                                <td className='table-custom-cell'>University</td>
                                <td className='table-custom-cell'>Registered Student</td>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </table>
                    )}
                </Table>
                
            </div>
        </>
    )
}

export default Page
