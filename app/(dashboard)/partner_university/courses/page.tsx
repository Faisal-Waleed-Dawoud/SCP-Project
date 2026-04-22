import Pagination from '@/components/pagination'
import { MAX_ROWS, Status } from '@/lib/types'
import React from 'react'
import { Courses } from './lib/types'
import { getCourses, getCoursesCount } from './lib/db'
import Search from '@/components/search'
import CreateCourse from './components/CreateCourse'
import Link from 'next/link'
import { File } from 'lucide-react'
import Table from '@/components/dashboard/Table'
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Courses",
};



async function Page({ searchParams }: { searchParams: Promise<{ query: string, page?: number }> }) {
    const { query, page } = await searchParams


    const pageNumber = page || 1
    const coursesCount = await getCoursesCount(query)
    const pages = Math.ceil(coursesCount / MAX_ROWS)
    const courses = await getCourses(query, pageNumber) as Courses[]

    const rows = []
    for (let i = 0; i < courses.length; i++) {
        const statusColor = courses[i].course_status === Status.pending ? "bg-yellow-200" : courses[i].course_status === Status.approved ? "bg-green-200" : "bg-red-200"
        rows.push(<tr key={i} className='hover:bg-[#eee] duration-300 border-b-2 border-b-gray-100'>
            <td className='table-custom-cell'>{courses[i].course_name}</td>
            <td className='table-custom-cell'>{courses[i].course_code}</td>
            <td className='table-custom-cell'><span className={`${statusColor} px-2 py-1 rounded-lg`}>{courses[i].course_status}</span></td>
            <td className='table-custom-cell flex justify-center'><Link href={courses[i].syllabus} className='w-fit flex justify-center items-center'><File className='duration-300 w-10 h-10 p-2 hover:bg-blue-400 hover:text-white rounded-lg'></File></Link></td>
        </tr>)
    }

    return (
        <>
            <Table>
                <Table.Header className="mb-3 flex justify-between">
                    <Table.Title text="Courses"></Table.Title>
                    <div className="flex gap-2 items-center">
                        <CreateCourse></CreateCourse>
                        <Search text="search for a course"></Search>
                    </div>
                </Table.Header>
                <Table.Data pageNumber={pageNumber} pages={pages} className="w-full mb-3">
                    <thead>
                        <tr className="border-b-2 border-b-gray-100">
                            <td className="table-custom-cell">
                                Course Name
                            </td>
                            <td className="table-custom-cell">
                                Course Code
                            </td>
                            <td className="table-custom-cell">
                                Status
                            </td>
                            <td className="table-custom-cell">
                                Syllabus
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table.Data>
                <Pagination pageNumber={pageNumber} pageLimit={pages}></Pagination>
            </Table>
        </>
    )
}

export default Page
