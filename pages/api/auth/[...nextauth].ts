import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress, Keyring } from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { AssetBalance } from '@polkadot/types/interfaces';
import { Int } from '@polkadot/types';

declare module 'next-auth' {
  interface Session {
    address: string | undefined;
    ksmAddress: string;
    freeBalance: BN;
    name: string;
    assetBalance?: string;
  }

  interface User {
    id: string;
    ksmAddress: string;
    freeBalance: BN;
    assetBalance?: string;
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
          // AA: specify xx Network
          const keyring = new Keyring({ type: 'sr25519', ss58Format: 55 });

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

          // verify the account has the defined token
          const wsProvider = new WsProvider(process.env.RPC_ENDPOINT ?? 'ws://192.168.1.3:63007');
          const api = await ApiPromise.create({ provider: wsProvider });
          await api.isReady;

          if (credentials?.address) {
            // AA: encode wallet address for ss58Format 55
            const ksmAddress = encodeAddress(credentials.address, 55);
            console.log("ksmAddress: ", ksmAddress);
            const accountInfo = (await api.query.system.account(ksmAddress)) as any;
            const balance = accountInfo.data.free.add(accountInfo.data.reserved);
            // AA: write ksmAddress for xx Network to console            
            console.log('Wallet address on xx Network: ', ksmAddress);
            console.log('Wallet balance on xx Network: ', balance.toString());

            // AA: asset balance check 
            const assetId = 5; // AA: Replace with your asset ID
            const accountAssetInfo = await api.query.assets.account(assetId, ksmAddress);
            // initialize assetBalance as 0
            let assetBalance = 0;
            if (accountAssetInfo.isEmpty) {
              console.log(
                `No balance found for asset ${assetId} and address ${ksmAddress}`
              );
            } else {
                assetBalance = (accountAssetInfo.toHuman() as { balance: string }).balance ? parseInt((accountAssetInfo.toHuman() as { balance: string }).balance) : 0;
                console.log(
                `Account balance for asset ${assetId} and address ${ksmAddress}:`,
                assetBalance
                );
                console.log('Asset balance: ', assetBalance);
                if (assetBalance < 2) {
                console.warn(`Warning: Account balance for asset ${assetId} is less than 2.`);
                }
            };
            // end asset balance check
            
            console.log('Asset balance going into returned objected: ', assetBalance.toString());
            if (accountInfo.data.free.gt(new BN(1_000_000_000)) || assetBalance >= 1) {
              // if the user has a free balance > 1 XX or JUNK !> 0, we let them in
              return {
                id: credentials.address,
                name: credentials.name,
                freeBalance: accountInfo.data.free,
                ksmAddress,
                assetBalance: assetBalance.toString()
              };
            } else {
              return Promise.reject(new Error('🚫 The gate is closed for you'));
            }
            // highlight-end
          }

          return Promise.reject(new Error('🚫 API Error'));
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
        token.assetBalance = user.assetBalance;
      }
      return token;
    },
    async session(sessionData) {
      const { session, token } = sessionData;

      session.address = token.sub;
      session.assetBalance = token.assetBalance as string | undefined;
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
