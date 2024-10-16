import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress, Keyring } from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from '@polkadot/util';

declare module 'next-auth' {
  interface Session {
    address: string | undefined;
    ksmAddress: string;
    freeBalance: BN;
  }

  interface User {
    id: string;
    ksmAddress: string;
    freeBalance: BN;
  }

  interface credentials {
    address: string;
    message: string;
    signature: string;
    csrfToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        address: {
          label: 'Address',
          type: 'text',
          placeholder: '0x0',
        },
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
        csrfToken: {
          label: 'CSRF Token',
          type: 'text',
          placeholder: '0x0',
        },
        name: {
          label: 'Name',
          type: 'text',
          placeholder: 'name',
        },
      },
      async authorize(credentials): Promise<User | null> {
        if (credentials === undefined) {
          return null;
        }
        try {
          const message = JSON.parse(credentials.message);

          //verify the message is from the same uri
          if (message.uri !== process.env.NEXTAUTH_URL) {
            return Promise.reject(new Error('🚫 You shall not pass!'));
          }

          // verify the message was not compromised
          if (message.nonce !== credentials.csrfToken) {
            return Promise.reject(new Error('🚫 You shall not pass!'));
          }

          // verify signature of the message
          // highlight-start
          const { isValid } = signatureVerify(
            credentials.message,
            credentials.signature,
            credentials.address,
          );
          // highlight-end

          if (!isValid) {
            return Promise.reject(new Error('🚫 Invalid Signature'));
          }

	  // AA: specify xx Network
	  const keyring = new Keyring({ type: 'sr25519', ss58Format: 55 });

	  // verify the account has the defined token
          const wsProvider = new WsProvider(
            process.env.RPC_ENDPOINT ?? 'ws://192.168.1.3:63007',
          );
          const api = await ApiPromise.create({ provider: wsProvider });
          await api.isReady;

          // AA: encode wallet address for ss58Format 55
          const ksmAddress = encodeAddress(credentials.address, 55);
          // AA: write ksmAddress for xx Network to console
          console.log('wallet address on xx Network: ', ksmAddress);

          return {
              id: credentials.address,
              name: credentials.name,
              freeBalance: api.createType('Balance', 0),  
              ksmAddress: ksmAddress,
            };

        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // maxAge: 3, // uncomment to test session expiration in seconds
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.freeBalance = user.freeBalance;
      }
      return token;
    },
    async session(sessionData) {
      const { session, token } = sessionData;

      session.address = token.sub;
      if (session.address) {
        session.ksmAddress = encodeAddress(session.address, 55);
      }

      // as we already queried it, we can add whatever token to the session,
      // so pages can use it without an extra query
      session.freeBalance = token.freeBalance as BN;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    newUser: '/',
  },
};

export default NextAuth(authOptions);
