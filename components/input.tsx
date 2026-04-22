import { BaseFormState, InputProps } from '@/lib/types'
import React from 'react'



// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Input<S extends BaseFormState<any>>({title, id, name, errorName, state, type = "text", defaultValue, readonly}: InputProps<S>) {


    return (
        <div className='flex grow flex-col gap-2'>
            <label className='text-start' htmlFor={id}>{title} <span className='text-red-500'>*</span></label>
            <input readOnly={readonly}  defaultValue={state?.payload?.get(name) as string || defaultValue} className={`input-field ${errorName && state?.errors?.[errorName] && "outline-red-500"} ${readonly ? "bg-gray-100 cursor-not-allowed" : ""}`} type={type} id={id} name={name}></input>
            {errorName && state?.errors?.[errorName] && <p className='text-red-500'>{state.errors?.[errorName]}</p>}
        </div>
    )
}

export default Input
