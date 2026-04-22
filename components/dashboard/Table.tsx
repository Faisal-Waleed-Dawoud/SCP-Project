import React from 'react'
import NotFoundData from './NotFoundData'


function Table({className, children} : {className?: string, children: React.ReactNode}) {

    return (
        <div className={`rounded-md border shadow-custom p-3 overflow-x-auto ${className}`}>
            {children}
        </div>
    )
}

function TableHeader({className, children} : {className: string, children: React.ReactNode}) {
    return (
        <div className={className}>
            {children}
        </div>
    )
}

function TableData({pageNumber, pages, className, children} : {pageNumber: number, pages: number, className?: string, children: React.ReactNode}) {
    return (
        <>
            {+pageNumber < 1 || +pageNumber > pages ? (<NotFoundData></NotFoundData>) : (<table className={className}>{children}</table>)}
        </>
    )
}

function TableTitle({className, text} : {className?: string, text: string}) {
    return (<h3 className={className || "text-3xl font-semibold"}>{text}</h3>)
}

Table.Header = TableHeader
Table.Data = TableData
Table.Title = TableTitle

export default Table
