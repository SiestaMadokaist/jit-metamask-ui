import { ethers } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ContractHandler } from "../../lib/ContractHandler"
import { EtherValue } from "../../lib/EtherValue";
import { InternalLink } from "../../lib/InternalLink";
import styles from './view.module.css';

export interface ITxLog {
  log: ethers.providers.Log;
  key?: string;
  style?: React.CSSProperties;
}
export function TxLog(props: ITxLog): JSX.Element {
  const { log } = props;
  const [logDescription, setDescription] = useState<ethers.utils.LogDescription | Error>();
  useEffect(() => {
    (async () => {
      const contract = await ContractHandler.load(log.address);
      const description = contract.interface.parseLog(log);
      setDescription(description);  
    })().catch((error: Error) => {
      setDescription(error);
    })
  }, [log]);
  if (!logDescription) {
    return (<div key={log.logIndex}></div>)
  } else if (logDescription instanceof Error) {
    return (<div key={log.logIndex}>
      Failed to Describe {log.data} from <InternalLink type="address" value={log.address} />
    </div>);
  }
  return (<div key={log.logIndex} style={props.style ?? {}} className={styles.txlog}>
    <div className={styles.wrapper}>
      <div className={styles.flexContainer}>
        <div style={{ minWidth: '30%' }}>
          <InternalLink type={'tx'} value={log.transactionHash} name={logDescription.name}></InternalLink>
          {/* <Link href={}>{logDescription.name}</Link> */}
        </div>
        <div>of</div>
        <div>
          <InternalLink type="address" value={log.address} />
        </div>
        <div>at #{log.blockNumber}</div>
      </div>
      {logDescription.eventFragment.inputs.map((input, index) => {
        const value = logDescription.args[index];
        return (<div className={styles.flexContainer} key={`txLogInput-${index}`}>
          <div style={{ minWidth: '30%', marginRight: '10px' }}>{input.name}: </div>
          <EtherValue signature={logDescription.signature} index={index} paramTypes={logDescription.eventFragment.inputs} contractAddress={log.address} key={`txLogValue-${index}`} value={value}></EtherValue>
        </div>);
      })}

    </div>
  </div>);
}