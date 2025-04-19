import NavLinks from "@/components/navlinks";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import('../lib/initOneSIgnal').then(({ initOneSignal }) => {
      initOneSignal();
    });
  }, []);
  return (
    <>
      <Component {...pageProps} />
      <NavLinks />
    </>
  )
}