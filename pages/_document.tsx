import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head >
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        {/*
          theme-color: sets browser chrome / Android status bar colour.
          It is also updated dynamically in _app.tsx whenever the user changes theme.
          Default = ikbu primary (#514cff).
        */}
        <meta name="theme-color" content="#514cff" />
        {/* iOS: keep content below the status bar — 'default' avoids black-translucent
            layout issues where content bleeds behind the notch.
            The notch/overscroll colour is handled via html { background: primary } in CSS. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
      </Head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { var t=null; var raw=localStorage.getItem('ui_prefs_v1'); if (raw) { var p=JSON.parse(raw||'{}'); var st=p&&p.theme; if (st==='ikbu'||st==='ikbu-dark') t=st; } if (!t) { t = 'ikbu-dark'; } document.documentElement.setAttribute('data-theme', t); } catch(e){} })();`
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
