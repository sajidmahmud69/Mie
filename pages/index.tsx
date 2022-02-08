import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import Center from '../components/Center'
import { getSession } from 'next-auth/react'

export default function Home() {
  return (
    <div className="bg-black h-screen overflow-hidden">
      
      <main className='flex'>
        <Sidebar />
        <Center />
      </main>
      <div>{/* Player */}</div>
    </div>
  )
}


// this is needed so that the pictures for the playlist doesn't show up as blank when it first renders
export async function getServerSideProps(context) {
  const session = await getSession (context)

  return {
    props: {
      session,
    }
  }
  
}