import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

const App = ({ Component, pageProps }: AppProps) => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <main className={inter.className}>
      <Head>
        <title>Apollo-blog</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme, fontFamily: 'Inter, sans-serif' }}
        >
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </main>
  );
};

export default App;
