import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import LoginButton from '@/components/login'
import { useSession } from 'next-auth/react'
import { usePolkadotExtension } from '@/hooks/usePolkadotExtension'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { data: session } = useSession()
  const { actingAccount, injector } = usePolkadotExtension()

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/polkadot.svg"
            alt="Polkadot Logo"
            width={240}
            height={77}
            priority
          />
          <p className={inter.className}>Tokengated Tutorial Demo</p>
        </div>
        <LoginButton />

        <div className={styles.description}>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/github.svg"
                alt="Github Repository"
                className={styles.githubLogo}
                width={16}
                height={16}
                priority
              />
              View the repo
            </a>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              📖 View the tutorial
            </a>
            <a
              href="/protected"
              rel="noopener noreferrer"
            >
              🔐 Go to /protected
            </a>
          </div>

          <pre className={ styles.sessionDebug }>
            session: {JSON.stringify(session, null, 2)}<br />
            actingAccount: { JSON.stringify( actingAccount, null, 2 ) }<br />
            injector: {JSON.stringify(injector, null, 2)}
          </pre>
      </main>
    </>
  )
}
