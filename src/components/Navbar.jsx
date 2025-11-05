import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        // Disable body scroll when mobile menu is open
        document.body.style.overflow = showMobileMenu ? 'hidden' : 'auto'
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [showMobileMenu])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md shadow-md' : 'bg-transparent'
                }`}
        >
            <div className='container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32'>
                {/* Brand Name 
                <h1 className='text-3xl font-extrabold text-white tracking-wider'>
                    <span className='text-orange-400'>V</span>ayuhu
                </h1>*/}
                <img
                    src={assets.brandLogo}
                    alt="Vayuhu Logo"
                    className="w-32 h-auto md:w-40 object-contain"
                />


                {/* Desktop Menu */}
                <ul className='hidden md:flex gap-7 text-white'>
                    <a href='#Header' className='cursor-pointer hover:text-gray-400'>
                        Home
                    </a>
                    <a href='#About' className='cursor-pointer hover:text-gray-400'>
                        About
                    </a>
                    <a href='#WorkSpaces' className='cursor-pointer hover:text-gray-400'>
                        WorkSpaces
                    </a>
                    <a href='#Testimonials' className='cursor-pointer hover:text-gray-400'>
                        Testimonials
                    </a>
                </ul>

                <button className='hidden md:block bg-white text-black font-medium px-8 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300'>
                    Sign up
                </button>

                {/* Mobile Menu Icon */}
                <img
                    onClick={() => setShowMobileMenu(true)}
                    src={assets.menu_icon}
                    className='md:hidden w-7 cursor-pointer invert'
                    alt='menu icon'
                />
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed right-0 top-0 bottom-0 bg-white transition-all duration-300 ease-in-out ${showMobileMenu ? 'w-full' : 'w-0 overflow-hidden'
                    }`}
            >
                <div className='flex justify-end p-6 cursor-pointer'>
                    <img
                        onClick={() => setShowMobileMenu(false)}
                        src={assets.cross_icon}
                        className='w-6'
                        alt='close menu'
                    />
                </div>
                <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
                    <a
                        onClick={() => setShowMobileMenu(false)}
                        href='#Header'
                        className='px-4 py-2 rounded-full inline-block'
                    >
                        Home
                    </a>
                    <a
                        onClick={() => setShowMobileMenu(false)}
                        href='#About'
                        className='px-4 py-2 rounded-full inline-block'
                    >
                        About
                    </a>
                    <a
                        onClick={() => setShowMobileMenu(false)}
                        href='#WorkSpaces'
                        className='px-4 py-2 rounded-full inline-block'
                    >
                        WorkSpaces
                    </a>
                    <a
                        onClick={() => setShowMobileMenu(false)}
                        href='#Testimonials'
                        className='px-4 py-2 rounded-full inline-block'
                    >
                        Testimonials
                    </a>
                </ul>
            </div>
        </div>
    )
}

export default Navbar
