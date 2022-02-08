import { NewNumber } from "@cryptoket/new-number";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ContractHandler } from "../../lib/ContractHandler";
import { EtherValue } from "../../lib/EtherValue";
import { InternalLink } from "../../lib/InternalLink";
import { MainApp } from "../../lib/MainApp";
import { MainState } from "../../lib/MainApp/state";
import { ITx, TxData } from "../../components/tx/data";
import { TxLog } from "../../components/tx/log";
import styles from './view.module.css';
import { GasCost } from "../../components/tx/GasCost";

export default function UITransactions(): JSX.Element {
  const router = useRouter();
  const { txid } = router.query;
  useEffect(() => {
    MainState.set('title', `tx: ${txid}`);
  }, [txid]);
  return (<MainApp>
    <$UITransactions txid={txid as string} full={true}></$UITransactions>
  </MainApp>);
}

export function $UITransactions(props: { txid: string; full?: boolean }): JSX.Element {
  const { txid } = props;
  const full = props.full ?? true;
  const [tx, setTx] = useState<ITx>();
  const [block, setBlock] = useState<ethers.providers.Block>();
  useEffect(() => {
    const provider = MainState.get('provider');
    if (!provider) { return; }
    if (!txid) { return; }
    (async () => {
      const receipt = await provider.getTransactionReceipt(txid as string);
      const request = await provider.getTransaction(txid as string);
      const block = await provider.getBlock(receipt.blockNumber);
      const contract = await ContractHandler.load(receipt.to).catch((error) => undefined);
      let errorMessage = undefined;
      console.log({ receipt });
      if (receipt.status === 0) {
        const error = await provider.call(request as ethers.PopulatedTransaction, request.blockNumber)
          .catch((e) => e);
        errorMessage = error?.data?.message ?? 'Unknown Error';
      }
      setTx({ receipt, request, contract, errorMessage });
      setBlock(block);
    })();
  }, [txid, full]);
  if (!tx?.receipt) {
    return (<div></div>);
  } else {
    const { receipt, request, contract } = tx;
    const { logs } = receipt;
    const defaultGasPrice = '5_000_000_000';
    const gasLimit = NewNumber.wei(request.gasLimit.toString());
    const gasUsed = NewNumber.wei(receipt.gasUsed.toString());
    const percentUsed = gasUsed.dividedToMultiplier(gasLimit).liftTo(NewNumber.percentage).toFixed(2);
    const gasPrice = NewNumber.multiplier(request.gasPrice?.toString() ?? defaultGasPrice);
    const totalGasCost = NewNumber.wei(receipt.gasUsed.toString()).multipliedBy(gasPrice);
    const mainWidth = full ? '100%' : '48%';
    const backgroundColor = tx.receipt.status ? 'aliceblue' : 'lightcoral';
    return (<div style={{ width: '100%', display: 'flex', marginBottom: '10px', backgroundColor, borderBottom: '1px black solid' }}>
        <div className={styles.metadata} style={{ width: mainWidth }}>
          <div>
            <InternalLink type={'tx'} value={txid}/>
          </div>
          {(() => {
            if (tx.errorMessage) {
              return (<div style={{ color: 'white' }}>
              <div style={{ backgroundColor: 'black', padding: '10px', margin: 'auto', maxWidth: '50%' }}>
                {tx.errorMessage}
              </div>
            </div>);
          }})()}
          <div className={styles.value}>
            <div>Time: </div>
            <div>{new Date((block?.timestamp ?? 0) * 1000).toString()}</div>
          </div>
          <div className={styles.value}>
            <div>From: </div>
            <div>
              <InternalLink type="address" value={receipt.from} />
            </div>
          </div>
          <div className={styles.value}>
            <div>To: </div>
            <div>
              <InternalLink type="address" value={receipt.to} />
            </div>
          </div>
          <div className={styles.value}>
            <div>Gas Used: </div>
            <div>{gasUsed.toString()}/{gasLimit.toString()}</div>
            <div>({percentUsed.toString()}%)</div>
          </div>
          <div className={styles.value}>
            <div>Gas Price: </div>
            <div>{gasPrice.liftTo((n) => new NewNumber.Numeric(n, 9, 10)).toString()} gwei</div>
          </div>
          <GasCost gasCost={totalGasCost.normalized()} />
          <div className={styles.value}>
            <div>Value: </div>
            <div>{NewNumber.wei(request.value.toString()).normalized().toString()} ETH</div>
          </div>
          {(() => {
            if (receipt.contractAddress) {
              return (<div>
                <div>Created: </div>
                <div>
                  <InternalLink type="address" value={receipt.contractAddress} />
                </div>
              </div>);
            }
          })()}
          <TxData request={tx.request} receipt={tx.receipt} contract={tx.contract}></TxData>
        </div>
        {(() => {
          if (full) {
            return (
              <div style={{ width: '48%' }}>
              <div style={{ margin: '10px'}}>Tx Logs:</div>
              {logs.map((log, i) => (<TxLog log={log} key={`log-${i}`}/>))}
            </div>);
          } else {
            return (<div></div>);
          }
        })()}
      </div>);
  }
}