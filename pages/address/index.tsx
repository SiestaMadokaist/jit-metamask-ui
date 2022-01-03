import { MainApp } from "../../lib/MainApp";
import fs from 'fs';
import { useEffect, useState } from "react";
import { ContractHandler } from "../../lib/ContractHandler";
import { InternalLink } from "../../lib/InternalLink";
import { Sorter } from "../../lib/sorter";
import { MainState } from "../../lib/MainApp/state";


export default function ContractList(): JSX.Element {
  const [addresses, setContracts] = useState<{ name: string; address: string }[]>([]);
  useEffect(() => {
    (async () => {
      MainState.set('title', 'Address List');
      const provider = await MainState.get('provider');
      const response = await fetch('./api/contracts', { 'headers': { 'Content-Type': 'application/json' }});
      const { knownAddress } = await response.json();
      const contractPromises = (knownAddress as string[]).map(async (k) => {
        const name = await ContractHandler.contractName(k, provider);
        return { name, address: k };
      });
      const contracts = await Promise.all(contractPromises);
      // console.log({ contracts });
      // setContracts([]);
      setContracts(contracts.sort((a, b) => Sorter.String(a.name, b.name)));
    })();
  }, []);
  return (<MainApp>
    <div style={{ margin: '10px' }}>
      {addresses.map((a, i) => (
        <div key={a.address}>
          <InternalLink type={'address'} value={a.address} name={a.name}></InternalLink>
        </div>  
      ))}
    </div>
  </MainApp>);
}