import React, { useEffect } from "react";
import { observer } from 'mobx-react-lite';
import { MainState } from "./state";
import Link from 'next/link';
import { ethers } from "ethers";
import type EventEmitter from "events";
import { InternalLink } from "../InternalLink";
import Head from "next/head";

function _MainApp(props: React.PropsWithChildren<unknown>): JSX.Element {
  useEffect(() => {
    const ethereum: EventEmitter = (window as any).ethereum;
    (window as any).MainState = MainState;
    const onAccountChanged = (accounts: (string | undefined)[]) => {
      console.log('accounts', accounts);
      const [ account ] = accounts;
      if (account) {
        MainState.set('signerAddress', account);
      };
    };
    onAccountChanged([(ethereum as any).selectedAddress]);
    console.log(`listening account metamask`);
    ethereum.on('accountsChanged', onAccountChanged);

    const onChainChanged = (_chainId: number) => {
      const prevProvider = MainState.get('provider');
      if (prevProvider) {
        prevProvider.removeAllListeners();
      };
      const provider = new ethers.providers.Web3Provider(ethereum as any);
      MainState.set('provider', provider);
    };
    onChainChanged(0);
    console.log('listening chain metamask');
    ethereum.on('chainChanged', onChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', onAccountChanged);
      ethereum.removeListener('chainChanged', onChainChanged);
    };
  }, []);
  return (<div>
    <Head>
      <title>{MainState.get('title')}</title>
    </Head>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: '10px' }}>
        <div>
          <Link href={'/address'}>Address</Link>
        </div>
        <div>
          <Link href={'/tx'}>TxList</Link>
        </div>
      </div>
      <div style={{ width: '60%'}}></div>
      <div>
        <InternalLink type="address" value={MainState.get('signerAddress') ?? ''} name={MainState.get('signerAddress')}></InternalLink>
      </div>
    </div>
    <div>
      {props.children}
    </div>
  </div>);
}

export const MainApp = observer(_MainApp);