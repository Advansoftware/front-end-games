import Head from 'next/head';
import { CssBaseline } from '@mui/material';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Gamepass Launcher</title>
        <meta name="description" content="Lançador de jogos inspirado no Xbox Gamepass" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;