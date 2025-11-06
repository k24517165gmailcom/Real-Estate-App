import React from 'react'
import About from '../components/About'
import Projects from '../components/Projects'
import Testimonials from '../components/Testimonails'
import Team from '../components/Team'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import WorkspacePricing from '../components/WorkspacePricing'

const Home = () => {
    return (
        <>
            <About />
            {/*<Projects />*/}
            <WorkspacePricing />
            <Testimonials />
            <Team />
            <Contact />
            <Footer />
        </>
    )
}

export default Home
