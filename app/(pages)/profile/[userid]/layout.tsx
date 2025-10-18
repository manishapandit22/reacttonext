import Header from '@/components/header/Header'
import React, { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}

