'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

export default ErrorBoundary;


// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// export default function GlobalError({ error }) {
//   const router = useRouter()
  
//   useEffect(() => {
//     console.error('Router error occurred:', error)
    
//     router.push('/')
//   }, [router])

//   return null
// }