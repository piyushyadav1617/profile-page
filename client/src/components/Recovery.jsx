import React,{useState, useEffect} from 'react'
import toast,{ Toaster } from 'react-hot-toast'
import {useNavigate } from 'react-router-dom'
import styles from '../styles/Username.module.css'
import { useAuthStore} from '../store/store'
import { generateOTP, verifyOTP } from '../helper/helper'

export default function Password() {
const {username} = useAuthStore(state=>state.auth)    
const [OTP, setOTP] =  useState();
 const navigate = useNavigate();
useEffect(()=>{
generateOTP(username).then(OTP=>{
    if(OTP) return toast.success('OTP has been sent to your mail')
    return toast.error('OTP could not be sent')
})
},[username])

async function onSubmit(e){
e.preventDefault();

try {
    let {status} = await verifyOTP({username, code:OTP});
    if(status === 201){
    toast.success('OTP verified successfully!')
    return navigate('/reset')
}
} catch (error) {
    return toast.error('Invalid OTP! Check again')
}



}
//function to resend otp
function resendOTP(){
let sendPromise = generateOTP(username);
toast.promise(sendPromise,{
    loading:"Sending...",
    success:<b>OTP has been sent!</b>,  
    error: <b>OTP could not be sent!</b>
});
sendPromise.then(OTP=>{
    console.log(OTP);
})
}


    return (
        <div className="container mx-auto">
            <Toaster position='top-center' reverseOrder={false}></Toaster>
            <div className='flex justify-center items-center h-screen'>
                <div className={styles.glass}>

                    <div className="title flex flex-col items-center">
                        <h4 className='text-5xl font-bold'>Recovery</h4>
                        <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                            Enter OTP to recover passowrd
                        </span>
                    </div>

                    <form className='pt-20' onSubmit={onSubmit} >
                      


                        <div className="textbox flex flex-col items-center gap-6">

                        <div className="input text-center">
                        <span className='py-4 text-sm text-left text-gray-500'>
                             Enter 6 digit OTP sent to your email address.
                        </span>
                            <input className={styles.textbox} type="text" placeholder='OTP' onChange={(e)=>setOTP(e.target.value)} />
                        </div>
                      
                            <button className={styles.btn} type='submit' >Recover</button>
                        </div>

                      

                    </form>
                    <div className="text-center py-4">
                            <span className='text-gray-500'>Can't get OTP? <button className='text-red-500' onClick={resendOTP}>Resend</button> </span>
                        </div>

                </div>
            </div>
        </div>
    )
}


