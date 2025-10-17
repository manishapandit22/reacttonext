import Header from '@/components/header/Header'
import React from 'react'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}