## README for xx Network

(See [KSM_README.md](./KSM_README.md) for upstream README document.)

What it is:
- Make access to your site or "gated" part of your site possible only to users with a certain amount of xx coins in their Polkadot{.js} (not .{js} - I made a typo in the screenshot) wallet
- You an also read wallet name - I have it `123123123` in the screenshot, but it'd normally be "Joe Mc Coin" or something more useful
- You can set that balance to any amount (10, 100, 100,000 XX) or mandate different balances for different paths on your Web site
- Works with static and dynamic Web pages

![Token-gated xx coin site](xx_screenshot.png)

Thank you to [the original author](https://polkadot.study/tutorials/tokengated-polkadot-next-js/intro) and the guy who [forked it](https://github.com/yk909/polkadot-js-tokengated-website/) to apply some fixes (verify/compare if you plan to use in production, of course).

This sort of works now and I'm sharing in the hope someone will use it for xx Network or other Substrate projects/chains for which the upstream forks don't provide instructions. 

## How to run

Install Polkadot{.js} extension, create xx Network wallet, fund it with some amount of xx coins (1.01, for example) and set it to work on `xx Network`.

![xx_polkadot_extension.png](./xx_polkadot_extension.png)

Download this repo, create `.env.local` in root directory, and run:

```sh
cp .env.local.example .env.local
vim .env.local
npm run dev
```

My .env.local for non-production use:

```raw
NEXTAUTH_SECRET=123123123
NEXTAUTH_URL=http://localhost:3000
RPC_ENDPOINT=ws://192.168.1.30:63007
```

Go to http://localhost:3000 in the browser in which you installed Polkadot{.js} and connect the extension to http://localhost:3000, generate an address and make it restricted for use on xx Network (I hoped this would ensure balance will be looked up correctly, but it was not).

With that, I can login (see [xx_screenshot.png](./xx_screenshot.png) and balance of xx coins is correctly shown (since v1.1). We could probably check for assets/tokens issued on xx Network as well, but I haven't looked into that yet.

(Note that, if you go to https://wallet.xx.network, Polkadot{.js} can let you add the wallet from the browser extension and show it in xx Network Wallet. Neat!)

`npm run build` builds okay, but has warnings about multiple versions of some package, etc. I don't know JS well enough to fix this quickly.

## What modified and why

`.env.local` and `pages/api/auth/[...nextauth].js` line 92 there's a fall back to public RPC endpoint, but I modified that one to local as well. 

In `components/login.tsx` I added some functions for debugging, and logging to console.

In `pages/protected-api.tsx` and `pages/protected.tsx` ("static" protected page), changed KSM to XX and changed the number of decimals to 9 from 12:
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

### Address format

Internally, the xx wallet address is shown in generic Polkadot format, which is fine - the same private key could be used with a number of Substrate chain addresses.

```raw
token {
  name: '123123123',
  sub: '5GxeeFALkRvjnNgkiMjiP6q2GGnZ1ZmFyjCusHG4VoezqZSN',
  freeBalance: '0x000000000000000000000000b14a8cbc',
  iat: 1729956938,
  exp: 1732548938,
  jti: '3252212b-0fb2-4a82-88d0-3ceaf5886aa1'
}
```

The FAQs say [it's normal to see another address](https://polkadot.js.org/docs/keyring/FAQ#my-pair-address-does-not-match-with-my-chain).

You can configure the wallet to default to xx Network, by the way (see the screenshot), to avoid that.

### Token-gating doesn't work for NFT ("asset")

That would need additional development, as wallet (address) balances is different from NFT (asset) lookup where one not only looks up free balance for each NFT, but NFT names, amounts, units, and other metadata from a different Polkadot pallet.

I looked briefly and it seemed much more complex than wallet balance.
