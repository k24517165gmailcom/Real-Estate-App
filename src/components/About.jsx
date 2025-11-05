import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'

const About = () => {
    return (
        <motion.section
            id='About'
            initial={{ opacity: 0, x: 200 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className='flex flex-col items-center justify-center container mx-auto py-20 px-6 md:px-20 lg:px-32 overflow-hidden'
        >
            {/* Heading */}
            <h1 className='text-3xl sm:text-5xl font-bold text-center mb-3'>
                About <span className='text-orange-500'>Vayuhu</span>
            </h1>
            <p className='text-gray-500 text-center max-w-2xl mb-12'>
                Redefining the modern workspace with flexibility, creativity, and community.
                Vayuhu brings professionals, freelancers, and startups together under one inspiring roof.
            </p>

            {/* Content */}
            <div className='flex flex-col md:flex-row items-center md:items-start gap-16'>
                <img
                    src={assets.brand_img}
                    alt='Vayuhu Coworking Space'
                    className='w-full md:w-1/2 rounded-2xl shadow-lg'
                />

                <div className='flex flex-col items-start text-gray-700 max-w-lg'>
                    {/* Quick stats */}
                    <div className='grid grid-cols-2 gap-8 mb-10 w-full'>
                        <div>
                            <p className='text-4xl font-bold text-orange-500'>50+</p>
                            <p className='text-sm'>Active Members</p>
                        </div>
                        <div>
                            <p className='text-4xl font-bold text-orange-500'>Bengaluru</p>
                            <p className='text-sm'>Our Prime Workspace Location</p>
                        </div>
                        <div>
                            <p className='text-4xl font-bold text-orange-500'>30+</p>
                            <p className='text-sm'>Flexible Desks</p>
                        </div>
                        <div>
                            <p className='text-4xl font-bold text-orange-500'>24/7</p>
                            <p className='text-sm'>Access & Support</p>
                        </div>
                    </div>

                    {/* About text */}
                    <p className='text-base leading-relaxed mb-8'>
                        At <span className='font-semibold text-orange-500'>Vayuhu</span>, we believe that
                        innovation thrives in spaces designed for focus and collaboration. Our coworking
                        hub offers a blend of comfort, creativity, and community — helping professionals
                        and teams grow together in an inspiring environment.
                    </p>

                    <button className='bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-full transition-all duration-300'>
                        Learn More
                    </button>
                </div>
            </div>
        </motion.section>
    )
}

export default About
