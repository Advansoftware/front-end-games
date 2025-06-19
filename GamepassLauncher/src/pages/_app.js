import { GamesProvider } from '../contexts/GamesContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import { DownloadsProvider } from '../hooks/useDownloads';
import Head from 'next/head';
import { CssBaseline, Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Aguardar hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar se é página fullscreen apenas após hidratação
  const isFullscreenPage = mounted && (
    router.pathname === '/detalhes/[slug]' ||
    router.pathname.startsWith('/detalhes/')
  );

  return (
    <>
      <Head>
        <title>GamePass Launcher</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />

      {/* Aplicar estilos globais apenas após hidratação */}
      {mounted && (
        <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100vw;
            ${isFullscreenPage ? 'height: 100vh; overflow: hidden;' : 'min-height: 100vh;'}
            background: transparent;
          }
          
          #__next {
            margin: 0;
            padding: 0;
            width: 100vw;
            ${isFullscreenPage ? 'height: 100vh; overflow: hidden;' : 'min-height: 100vh;'}
          }
          
          * {
            box-sizing: border-box;
          }
          
          ${!isFullscreenPage ? `
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          ` : ''}
        `}</style>
      )}

      <ThemeContextProvider>
        <DownloadsProvider>
          <GamesProvider>
            <Box
              sx={{
                width: '100vw',
                ...(mounted && isFullscreenPage ? {
                  height: '100vh',
                  overflow: 'hidden',
                  position: 'relative'
                } : {
                  minHeight: '100vh'
                }),
                margin: 0,
                padding: 0
              }}
            >
              <Component {...pageProps} />
            </Box>
          </GamesProvider>
        </DownloadsProvider>
      </ThemeContextProvider>
    </>
  );
}

export default MyApp;