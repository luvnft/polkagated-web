import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';

import LoginButton from '@/components/login';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

type TokenLevels = {
  free?: number;
  standard?: number;
  premium?: number;
  id?: number;
};

export const tokenAssetConfig = {
  // load JSON file with token asset configuration from TOKEN_ASSET_CFG variable: {"JUNK":{"standard": 1,"premium":2},"GOLD":{"free": 0, "standard": 1, "premium":2}}
  TAConfig: new Map<string, TokenLevels>(Object.entries(JSON.parse(process.env.NEXT_PUBLIC_TOKEN_ASSET_CFG || '{}')))
};

console.log("Configuration JSON in index.tsx: ", tokenAssetConfig.TAConfig);

export default function Home() {
  const preRenderedTokenAssetCfg = JSON.stringify(Object.fromEntries(tokenAssetConfig.TAConfig), null, 2).replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>');
  console.log("Configuration pre-rendered HTML: ", preRenderedTokenAssetCfg);
    
  return (
    <>
      <Head>
        <title>Polkadot Token- and Asset-gated Tutorial</title>
        <meta
          name="description"
          content="Demo Tutorial dApp using Polkadot.js API (xx Network flavor) and next-auth to build a token-gated and asset-gated web application."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1340 1410.3' xml:space='preserve'%3E%3Cellipse fill='%23E6007A' cx='663' cy='147.9' rx='254.3' ry='147.9'/%3E%3Cellipse fill='%23E6007A' cx='663' cy='1262.3' rx='254.3' ry='147.9'/%3E%3Cellipse transform='rotate(-60 180.499 426.56)' fill='%23E6007A' cx='180.5' cy='426.5' rx='254.3' ry='148'/%3E%3Cellipse transform='rotate(-60 1145.575 983.768)' fill='%23E6007A' cx='1145.6' cy='983.7' rx='254.3' ry='147.9'/%3E%3Cellipse transform='rotate(-30 180.45 983.72)' fill='%23E6007A' cx='180.5' cy='983.7' rx='148' ry='254.3'/%3E%3Cellipse transform='rotate(-30 1145.522 426.601)' fill='%23E6007A' cx='1145.6' cy='426.6' rx='147.9' ry='254.3'/%3E%3C/svg%3E"
        />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/xxNetwork.svg"
            alt="XX Network Logo"
            width={240}
            height={77}
            priority
          />
          <p className={inter.className}>Token- and asset-gated Tutorial Demo for xx Network (Substrate-based token & assets)</p>
        </div>
        <LoginButton />
        <h3>Membership Levels</h3>
        <p>&nbsp;</p>
        <p className={inter.className}>This site provides different levels of service based on the holdings of the wallet you choose to login with.</p>
        <p>&nbsp;</p>
        <table className={styles.tokenAssetTable} style={{ width: '30%' }}>
          <thead>
            <tr>
            <th style={{ textAlign: 'left', margin: '2px' }}>Token</th>
            <th style={{ textAlign: 'left', margin: '2px' }}>Level</th>
            <th style={{ textAlign: 'center', margin: '2px' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(tokenAssetConfig.TAConfig.entries()).map(([token, levels]) =>
                  Object.entries(levels).map(([level, value]) => (
                    level !== 'id' && (
                    <tr key={`${token}-${level}`}>
                      <td style={{ margin: '2px' }}>{token}</td>
                      <td style={{ margin: '2px' }}>{level}</td>
                      <td style={{ textAlign: 'center', width: 20, margin: '2px' }}>{value}</td>
                    </tr>
                    )
                  ))
                  )}
          </tbody>
        </table>
        <p>&nbsp;</p>
        <h3>Token-Asset Configuration</h3>
        <p>&nbsp;</p>
        <p>.env.local.NEXT_PUBLIC_TOKEN_ASSET_CFG (JSON):</p>
        <p>&nbsp;</p>
        <div className={styles.tokenAssetCfg} style={{ backgroundColor: '#0DB9CB', width: '20%' }} dangerouslySetInnerHTML={{ __html: preRenderedTokenAssetCfg }} />
        <p>&nbsp;</p>
        <div className={styles.description}>
          <Link href="/">
            🏠 Home page
          </Link>
          <Link href="/protected" rel="noopener noreferrer">
            🔐 To /protected (SSR)
          </Link>
          <Link href="/protected-api" rel="noopener noreferrer">
            🔐 To /protected-api (Static)
          </Link>
          <Link href="https://polkadot.study/tutorials/tokengated-polkadot-next-js/intro">
            🎓 Tutorial
          </Link>
          <a href="https://github.com/armchairancap/polkadot-js-tokengated-website" target="_blank">
          <Image
              src="/github.svg"
              alt="Github Repository"
              className={styles.githubLogo}
              width={16}
              height={16}
              priority
            />
            Source code
            </a>          
        </div>
      </main>
    </>
  );
}
