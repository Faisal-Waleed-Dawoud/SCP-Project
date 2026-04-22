import CreateUser from '@/app/(dashboard)/admission/users/components/createUser';
import DeleteUser from '@/app/(dashboard)/admission/users/components/deleteUser';
import Pagination from '@/components/pagination';
import Search from '@/components/search';
import { MAX_ROWS } from '@/lib/types';
import { getCurrentUser } from '@/lib/utils';
import React from 'react'
import Generatexlsx from '../../../../components/dashboard/generatexlsx';
import { getUsers, getUsersCount } from './lib/db';
import { SafeUser } from './lib/types';
import UpdateUserServer from './components/updateUserServer';
import Table from '@/components/dashboard/Table';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Users",
};


async function Page({ searchParams }: { searchParams: Promise<{ query: string, page?: number }> }) {

    const { query, page } = await searchParams

    const pageNumber = page || 1
    const [
        currentUser,
        usersCount,
        users
    ] = await Promise.all([
        getCurrentUser({ fullUser: false, redirectIfNotFound: false }),
        getUsersCount(query),
        getUsers(query, pageNumber) as unknown as SafeUser[]
    ])
    
    const pages = Math.ceil(usersCount / MAX_ROWS)
    
    const rows = []
    for (let i = 0; i < users.length; i++) {
        rows.push(<tr key={i} className='hover:bg-[#eee] duration-300 border-b-2 border-b-gray-100'>
            <td className='table-custom-cell'>{users[i].firstName}</td>
            <td className='table-custom-cell'>{users[i].lastName}</td>
            <td className='table-custom-cell'>{users[i].email}</td>
            <td className='table-custom-cell'>{users[i].role}</td>
            <td className='table-custom-cell'>
                <div className='flex gap-2 items-center justify-center'>
                    {currentUser?.userId != users[i].id && users[i].role !== currentUser?.role && <>
                        <DeleteUser id={users[i].id}></DeleteUser>
                        <UpdateUserServer id={users[i].id}></UpdateUserServer>
                    </>
                    }
                </div>
            </td>
        </tr>)
    }

    return (
        <>
            <Table>
                <Table.Header className="mb-3 flex justify-between">
                    <Table.Title text="Users"></Table.Title>
                    <div className="flex gap-2 items-center">
                        <Generatexlsx count={usersCount} query={query} apiURL="/api/admission/users" fileName="users.xlsx"></Generatexlsx>
                        <CreateUser></CreateUser>
                        <Search text="search for a user"></Search>
                    </div>
                </Table.Header>
                <Table.Data pageNumber={pageNumber} pages={pages} className="w-full mb-3">
                    <thead>
                        <tr className="border-b-2 border-b-gray-100">
                            <td className="table-custom-cell">
                                First Name
                            </td>
                            <td className="table-custom-cell">
                                Last Name
                            </td>
                            <td className="table-custom-cell">
                                Email
                            </td>
                            <td className="table-custom-cell">
                                Role
                            </td>
                            <td className="table-custom-cell">
                                Actions
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
