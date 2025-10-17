"use client";

import WalletModal from "@/components/modals/WalletModal";
import "../public/styles/style.css";
import "swiper/css";
// import "swiper/css/pagination";
import "tippy.js/dist/tippy.css";
import "react-modal-video/css/modal-video.css";
import BuyModal from "@/components/modals/BuyModal";
import BidModal from "@/components/modals/BidModal";
import PropertiesModal from "@/components/modals/PropertiesModal";
import LevelsModal from "@/components/modals/LevelsModal";
import ModeChanger from "@/components/common/ModeChanger";
import LoginModal from "@/components/modals/LoginModal";
import LoginModalForCreating from "@/components/modals/LoginModalForCreating";
import ToastNotification from "@/components/ToastNotification";
import BuyPointsModal from "@/components/modals/BuyPointsModal";
import Script from 'next/script'

if (typeof window !== "undefined") {
  // Import the script only on the client side
  import("bootstrap/dist/js/bootstrap.esm").then((module) => {
    // Module is imported, you can access any exported functionality if
  });
}

import { UserProvider } from '@/contexts/UserContext';
import { useEffect } from "react";
import {  useRouter } from "next/navigation";

export default function RootLayout({ children }) {

  const router = useRouter()

  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message?.includes('router')) {
        event.preventDefault()
        console.error('Caught router error:', event.error)
        router.push('/')
      }
    }

    window.addEventListener('error', handleError)
    
    return () => window.removeEventListener('error', handleError)
  }, [router])

  return (
    <html lang="en" className="dark">
      <head>
        {/* Base meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="google-site-verification" content="TlaEKaQfdg7kRCu13RW_4PYpwq632AGRRdwNO-xc-fg" />
        
        {/* Basic meta tags only - page-specific meta tags are handled by each page's metadata */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        
        {/* Google Analytics */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
        
        {/* Dynamic metadata helper script */}
        <Script id="dynamic-metadata-helper">
          {`
            // This script helps with dynamic metadata for social media platforms
            // It ensures that meta tags are properly set when the page loads
            document.addEventListener('DOMContentLoaded', function() {
              // Function to update meta tags when sharing
              window.updateMetaTags = function(data) {
                if (!data) return;
                
                // Helper function to set or create meta tag
                function setMetaTag(name, content, isProperty = false) {
                  if (!content) return;
                  
                  // Try to find existing tag
                  let selector = isProperty ? 
                    'meta[property="' + name + '"]' : 
                    'meta[name="' + name + '"]';
                  let meta = document.querySelector(selector);
                  
                  // Create if it doesn't exist
                  if (!meta) {
                    meta = document.createElement('meta');
                    if (isProperty) {
                      meta.setAttribute('property', name);
                    } else {
                      meta.setAttribute('name', name);
                    }
                    document.head.appendChild(meta);
                  }
                  
                  // Set content
                  meta.setAttribute('content', content);
                }
                
                // Set OpenGraph tags
                setMetaTag('og:title', data.title, true);
                setMetaTag('og:description', data.description, true);
                setMetaTag('og:image', data.image, true);
                setMetaTag('og:url', data.url, true);
                
                // Set Twitter tags
                setMetaTag('twitter:title', data.title);
                setMetaTag('twitter:description', data.description);
                setMetaTag('twitter:image', data.image);
                
                console.log('Meta tags updated dynamically');
              };
            });
          `}
        </Script>
      </head>
      <body
        itemScope
        itemType="http://schema.org/WebPage"
        className={
          "overflow-x-hidden font-body text-jacarta-500 dark:bg-jacarta-900"
        }
      >
        <UserProvider>
          <ModeChanger />
          {children}
          <WalletModal />
          <BuyModal />
          <BidModal />
          <PropertiesModal />
          <LevelsModal />
          <LoginModal />
          <LoginModalForCreating />
          <ToastNotification />
          <BuyPointsModal />
        </UserProvider>
        {/* Microsoft Clarity Analytics */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "qo0vnmpzur");
          `}
        </Script>
      </body>
    </html>
  );
}
