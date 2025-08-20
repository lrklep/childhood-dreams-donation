import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Fund childhood experiences people couldn't have. From PS5s to sports cars - help kids and adults experience their dreams!" />
        <meta name="keywords" content="donation, childhood dreams, gaming, toys, experiences, charity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Childhood Dreams - Fund What You Never Had" />
        <meta property="og:description" content="Remember what you couldn't have as a kid? Help someone else experience it now!" />
        <meta property="og:type" content="website" />
        
        {/* Razorpay script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        
        {/* 90s favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
