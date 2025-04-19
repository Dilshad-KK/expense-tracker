import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { initOneSignal } from '../lib/initOneSIgnal'; // update with your path


export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initOneSignal();
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}