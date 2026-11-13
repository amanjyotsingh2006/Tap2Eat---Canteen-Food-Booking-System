import React from 'react'
import { Link } from 'react-router-dom'

const PopularFoodCard = ({ image, name, rating, price }) => {
    return (
        <div className='rounded-2xl bg-gray-50 w-60 pb-8'>
            <img src={image} alt={name} className='w-60 h-52 object-cover' />
            <div className='flex justify-between items-center px-4 py-3'>
                <h1 className='text-xl'>{name}</h1>
                <h1 className='text-orange-500'>★ {rating}</h1>
            </div>
            <div className='flex justify-between items-center px-4'>
                <p className='text-orange-500 text-xl font-bold'>₹{price}</p>
                <Link
                    to="/login"
                    className='w-8 h-8 bg-gray-300 flex justify-center items-center text-xl rounded-xl'
                >
                    {">"}
                </Link>
            </div>
        </div>
    )
}

export default PopularFoodCard
