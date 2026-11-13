import React from 'react'
import hero from "../assets/hero_main.png"

const ReviewCard = ({rating, comment, profilePic, name}) => {
  return (
    <div className='rounded-2xl bg-gray-50 w-90 h-70 p-8'>
        <p className='text-orange-500'>★★★★★</p>
        <p className='pb-5 pt-3 text-xl'>"{comment}"</p>
        <div className='flex gap-4 items-center pt-4'>
            <img src={hero} alt={name} className='w-10 rounded-4xl' />
            <h1 className='text-xl font-bold'>{name}</h1>
        </div>
    </div>
  )
}

export default ReviewCard
