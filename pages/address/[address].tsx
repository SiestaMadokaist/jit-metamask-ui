import { NewNumber } from "@cryptoket/new-number";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ContractHandler } from "../../lib/ContractHandler";
import { MainApp } from "../../lib/MainApp";
import { MainState } from "../../lib/MainApp/state";
import { TxCall } from "../../components/address/TxCall";
import { Sorter } from "../../lib/sorter";
import EventLog, { EventAddress } from './[address]/events';
import { InternalLink } from "../../lib/InternalLink";

export default function UIAddress(): JSX.Element {
  const router = useRouter();
  const address = router.query.address as string;
  const [contract, setContract] = useState<ethers.Contract | Error>(new Error());
  const [info, setInfo] = useState<{ balance: ethers.BigNumber, txCount: number }>({ balance: ethers.BigNumber.from(0), txCount: 0 });
  const [name, setName] = useState<string>('Standard Address');
  const [toggleEventShown, toggleEvent] = useState<boolean>();
  const [tokens, setTokens] = useState<Array<{ address: string; unit: string; balance: NewNumber.Cash }>>([]);
  useEffect(() => {
    const provider = MainState.get('provider');
    if (!address) { return; }
    if (!provider) { return; }
    (async () => {
      const code = await provider.getCode(address);
      if (!code) { return; }
      const _contract = await ContractHandler.load(address, provider).catch((error: Error) => error);
      setContract(_contract);
      const balance = await provider.getBalance(address);
      const txCount = await provider.getTransactionCount(address);
      setInfo({ balance, txCount });
      await ContractHandler.contractName(address, provider)
        .then((_name) => {
          setName(_name);
          MainState.set('title', _name);
        }).catch(() => {
          MainState.set('title', `addr: ${address}`);
        });
    })();
  }, [address]);
  useEffect(() => {
    (async () => {
      const provider = MainState.get('provider');
      if (!provider) { return; }
      const resp = await ContractHandler.tokenBalances(provider, address);
      setTokens(resp);
    })();
  }, [address]);
  if (contract instanceof Error) {
    return (<MainApp>
      <div style={{ textAlign: 'center'}}>{address}</div>
      <div style={{ margin: '10px' }}>
        Nonce: {info.txCount}
      </div>
      <div style={{ margin: '10px' }}>
        Balance: {NewNumber.wei(info.balance.toString()).normalized().toFixed(8)} ETH
      </div>
      <div style={{ margin: '10px'}}>
      <div style={{ height: '30px', width: '30%', }}>
        {tokens.map((t) => (<div style={{ display: 'flex', height: '30px', marginBottom: '5px' }} key={t.unit}>
          <div style={{ width: '200px'}}>{t.balance.toString()}</div>
          <div style={{ width: '200px' }}><InternalLink type='address' value={t.address} /></div>  
        </div>))}
      </div>
      </div>
    </MainApp>);
  };
  const functions = Object.keys(contract.interface.functions).map((k) => contract.interface.functions[k]);
  const readFunctions = functions.filter((x) => x.constant).sort((a, b) => Sorter.String(a.name, b.name));
  const writeFunctions = functions.filter((x) => !x.constant).sort((a, b) => Sorter.String(a.name, b.name));
  return (<MainApp>
    <div style={{ textAlign: 'center'}}>
      {address}
    </div>
    <div style={{ textAlign: 'center' }}>
      <b>({ name })</b>
    </div>
    <div style={{ width: '100%' }}>
      {(() => {
        if (toggleEventShown) {
          return (<div style={{ width: '100%' }}>
            <button style={{ margin: '10px', width: '90%', height: '30px'}} onClick={() => { toggleEvent(false)}}>Hide Events</button>
            <EventAddress address={address}></EventAddress>
          </div>);
        } else {
          return (<button style={{ margin: '10px', width: '90%', height: '30px'}} onClick={() => { toggleEvent(true)}}>Show Events</button>)
        }
      })()}
    </div>
    <div style={{ margin: '10px' }}>
      Balance: {NewNumber.wei(info.balance.toString()).normalized().toFixed(8)} ETH
    </div>
    <div style={{ margin: '10px' }}>
      Nonce: {info.txCount}
    </div>
    <div style={{ margin: '10px'}}>
        {tokens.map((t) => (<div style={{ display: 'flex', height: '30px', marginBottom: '5px' }} key={t.unit}>
          <div style={{ width: '200px'}}>{t.balance.toString()}</div>
          <div style={{ width: '200px' }}><InternalLink type='address' value={t.address} /></div>  
        </div>))}
    </div>
    <div style={{ display: 'flex'}}>
      <div style={{ width: '48%', borderRight: '1px black solid' }}>
        <div style={{ textAlign: 'center' }}>#Read</div>
        {readFunctions.map((f) => {
        return (<TxCall f={f} key={f.name} contract={contract}/>)
      })}
      </div>
      <div style={{ width: '48%', marginLeft: '20px' }}>
        <div style={{ textAlign: 'center' }}>#Write</div>
        {writeFunctions.map((f) => {
        return (<TxCall f={f} key={f.name} contract={contract}/>)
      })}
      </div>
    </div>
    
  </MainApp>);
}