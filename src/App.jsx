import React, { useEffect } from 'react'
import Lenis from 'lenis'
import './App.css'
import Banner from './components/Banner'
import Navbar from './ui/Navbar'
import TechStack from './components/TechStack'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './ui/Footer'



function App() {

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <Navbar></Navbar>
      <main className="">
        <Banner></Banner>
        <TechStack></TechStack>
        <Projects></Projects>
        <Experience></Experience>
        <Contact></Contact>
       
      </main>

      <Footer></Footer>
    </div>
  )
}

export default App