import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import BurnShowcase from '@/components/BurnShowcase'
import AppShowcase from '@/components/AppShowcase'
import Download from '@/components/Download'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <BurnShowcase />
        <AppShowcase />
        <Download />
      </main>
      <Footer />
    </>
  )
}
