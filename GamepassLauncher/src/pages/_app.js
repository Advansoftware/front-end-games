import { GamesProvider } from '../contexts/GamesContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import Head from 'next/head';
import { CssBaseline, Box } from '@mui/material';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>GamePass Launcher</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <style jsx global>{`
        html, body, #__next {
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: transparent;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
      <ThemeContextProvider>
        <GamesProvider>
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Component {...pageProps} />
          </Box>
        </GamesProvider>
      </ThemeContextProvider>
    </>
  );
}

export default MyApp;