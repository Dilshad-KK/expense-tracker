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
        <meta name="theme-color" content="#000000" />
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
