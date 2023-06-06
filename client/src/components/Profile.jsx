import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast,{ Toaster } from 'react-hot-toast'
import { useFormik } from 'formik'
import avatar from '../assests/profile.png'
import styles from '../styles/Username.module.css'
import extend from '../styles/Profile.module.css'
import { profileValidation } from '../helper/validate'
import convertToBase64 from '../helper/convert'
import useFetch from '../hooks/fetch.hook'
import { useAuthStore } from '../store/store'
import { updateUser } from '../helper/helper'

export default function Profile() {
 
 const [file, setFile] = useState()
 const [{ isLoading, apiData, serverError }] =  useFetch()
 const navigate = useNavigate();


    const formik = useFormik({
        initialValues: {
            firstName : apiData?.firstName || '',
            lastName: apiData?.lastName || '',
            email: apiData?.email || '',
            mobile: apiData?.mobile || '',
            address : apiData?.address || ''
        },
        enableReinitialize:true,
        validate: profileValidation,
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async values => {
        values = Object.assign(values, {profile: file || apiData?.Profile || '' })
            let updatePromise = updateUser(values);
            toast.promise(updatePromise, {
                loading: "Updating...",
                success: <b>Updated successfully!</b>,
                error: <b>Could not update!</b>
            })
        }
    })

//formik doesn't support file upload so we need to write our own function
const onUpload = async (e)=>{
const base64 = await convertToBase64(e.target.files[0]);

setFile(base64);
}

function userLogout(){
    localStorage.removeItem('token');

}
if(isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
if(serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

    return (
        <div className="container mx-auto py-8 h-full">
            <Toaster position='top-center' reverseOrder={false}></Toaster>
            <div className='flex justify-center items-center h-screen'>
                <div className={` ${styles.glass} ${extend.glass} `} >

                    <div className="title flex flex-col items-center">
                        <h4 className='text-5xl font-bold'>Profile</h4>
                        <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                            You can update your profile details.
                        </span>
                    </div>

                    <form className='py-1' onSubmit={formik.handleSubmit}>
                        <div className='profile flex justify-center py-3'>
                           <label htmlFor="profile">
                           <img src={ file || apiData?.profile || avatar} className={`${styles.profile_img} ${extend.profile_img}`} alt="avatar" />

                           </label>
                           <input type="file" id='profile' name='profile' onChange={onUpload} />

                        </div>

                        <div className="textbox flex flex-col items-center gap-6">

                        <div className="name flex flex-col items-center w-full sm:flex-row sm:w-3/4 gap-6">
                          <input {...formik.getFieldProps('firstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='FirstName' />
                          <input {...formik.getFieldProps('lastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='LastName' />
                        </div>

                        <div className="name flex flex-col items-center w-full sm:flex-row sm:w-3/4 gap-6">
                          <input {...formik.getFieldProps('mobile')} className={`${styles.textbox} ${extend.textbox}`} type="tel" placeholder='Mobile' />
                          <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Email*' />

                        </div>


                        <input {...formik.getFieldProps('address')} className={`${styles.textbox} }`} type="text" placeholder='Address' />
                        <button className={styles.btn} type='submit'>Update</button>
                         
                        </div>

                        <div className="text-center py-4">
                            <span className='text-gray-500'>Come back later? <Link onClick={userLogout} className='text-red-500' to="/">Logout</Link></span>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    )
}

