## README for xx Network

Thank you to [the original author](https://polkadot.study/tutorials/tokengated-polkadot-next-js/intro) and the guy who [forked it](https://github.com/yk909/polkadot-js-tokengated-website/) to apply some fixes (verify/compare if you plan to use in production, of course).

This is partially working, but I'm sharing in the hope someone will use it for xx Network or other Substrate projects/chains for which the upstream forks don't provide instructions. 

## How to run

Install Polkadot{.js} extension, create xx Network wallet, fund it with some amount of xx coins (1.01, for example) and set it to work on `xx Network`.

Download this repo, create `.env.local` and run:

```sh
npm run dev
```

Go to http://localhost:3000 in the browser where you installed Polkadot{.js}, and connect the extension to http://localhost:3000 (see xx_polkadot_extension.png), generate an address and make it restricted for use on xx Network (I hoped this would ensure balance will be looked up correctly, but it was not).

With that, I can login but (see xx_screenshot.png) my balance is not correctly shown.

It's interesting that if you go to wallet.xx.network, Polkadot{.js} will add the wallet from the extension and show it in xx Wallet. Neat!

`npm run build` builds okay, but has warnings about multiple versions of some package, etc. I don't know JS well enough to fix this quickly.

## What modified and why

`.env.local` and `pages/api/auth/[...nextauth].js` line 92 there's a fall back to public RPC endpoint, but I modified that one to local as well. In the latter file there's also balance lookup which seems to be malfunctioning somehow.

In `components/login.tsx` I added some functions for debugging, and logging to console.

In `pages/protected-api.tsx` and `pages/protected.tsx` ("static" protected page), changed KSM to XX:
```sh
const ksmBalance = formatBalance( session.freeBalance, { decimals: 9, withSi: true, withUnit: 'XX' } )
```
All modified pages from yk909's fork (you can see in Commits):

```sh
modified:   components/account-select.tsx
modified:   components/login.tsx
modified:   package-lock.json
modified:   package.json
modified:   pages/api/auth/[...nextauth].ts
modified:   pages/protected-api.tsx
modified:   pages/protected.tsx
```

## Known issues

Upon login, incorrect wallet balance is not displayed (0 is shown) which means either it's failing to look it up or I messed the logic up while trying random things. 

It seems it's looking up the balance of the Kusama address instead of 6xxx on xx Network. This is what's output to console.

```raw
token {
  name: '123123123',
  sub: '5GxeeFALkRvjnNgkiMjiP6q2GGnZ1ZmFyjCusHG4VoezqZSN',
  freeBalance: '0x00000000000000000000000000000000',
  iat: 1729089706,
  exp: 1731681706,
  jti: '79ce6529-185f-4a3e-b68a-75d75a712438'
}
JSON Web Token {
  "name": "123123123",
  "sub": "5GxeeFALkRvjnNgkiMjiP6q2GGnZ1ZmFyjCusHG4VoezqZSN",
  "freeBalance": "0x00000000000000000000000000000000",
  "iat": 1729089706,
  "exp": 1731681706,
  "jti": "79ce6529-185f-4a3e-b68a-75d75a712438"
}
```

The FAQs say [it's normal to see another address](https://polkadot.js.org/docs/keyring/FAQ#my-pair-address-does-not-match-with-my-chain), but balance look up should work and it doesn't because my wallet balance is > 0 XX.



