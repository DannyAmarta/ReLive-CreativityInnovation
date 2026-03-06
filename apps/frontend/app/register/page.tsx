import React from 'react'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from '@/components/ui/textarea'
import AnimatedLogin from '@/components/AnimatedLogin'
const Register = () => {
  return (
        // <div className='container mx-auto h-screen justify-center flex'>
        //     <div className='items-center flex flex-wrap'>
        //         <div className='flex flex-col w-[400px] px-5 h-[600px]'>
        //             <h1 className='text-bold text-3xl py-10'>Register</h1>
        //             <Field data-invalid>
        //                 <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
        //                     <Textarea className=''
        //                         id="textarea-invalid"
        //                         placeholder="Type your message here."
        //                         aria-invalid
        //                     />
        //                 <FieldDescription>Please enter a valid message.</FieldDescription>
        //             </Field>
        //             <Field>
        //                 <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
        //                     <Textarea
        //                         id="textarea-invalid"
        //                         placeholder="Type your message here."
        //                         aria-invalid
        //                     />
        //                 <FieldDescription>Please enter a valid message.</FieldDescription>
        //             </Field>
        //             <Field data-invalid>
        //                 <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
        //                     <Textarea
        //                         id="textarea-invalid"
        //                         placeholder="Type your message here."
        //                         aria-invalid
        //                     />
        //                 <FieldDescription>Please enter a valid message.</FieldDescription>
        //             </Field>
        //         </div>
        //     </div>
        // </div>
        <AnimatedLogin/>
  )
}

export default Register