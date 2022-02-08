import { useEffect, useState } from "react";
import { MainApp } from "../../lib/MainApp";
import { MainState } from "../../lib/MainApp/state";
import { $UITransactions } from "./[txid]";

export default function UIListTx(): JSX.Element {
  const [txids, setTxids] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      MainState.set('title', 'Tx List');
      const provider = await MainState.get('provider');
      if (!provider) { return; }
      const currentBlock = await provider.getBlockNumber();
      const txs: string[] = [];
      for (let i = 0; i < 50; i++) {
        const block = await provider.getBlock(currentBlock - i);
        block.transactions.forEach((tx) => txs.push(tx));
      };
      setTxids(txs);
    })();
  }, []);
  return (<MainApp>
    {txids.map((txid) => {
      return (<$UITransactions key={txid} txid={txid} full={false}/>)
    })}
  </MainApp>);
}