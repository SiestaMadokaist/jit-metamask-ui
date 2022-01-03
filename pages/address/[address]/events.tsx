import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MainApp } from "../../../lib/MainApp";
import { MainState } from "../../../lib/MainApp/state";
import { TxLog } from '../../../components/tx/log';

interface IEventAddress {
  address: string;
}
export function EventAddress(props: IEventAddress): JSX.Element {
  const { address } = props;
  const [logs, setLogs] = useState<ethers.providers.Log[]>([]);
  useEffect(() => {
    (async () => {
      const provider = MainState.get('rpcProvider');
      if (!provider) { return; }
      const logs = await provider.getLogs({ address, fromBlock: 0, toBlock: 'latest' });
      setLogs(logs.reverse());
    })();
  }, [address]);
  return (<div>
    {logs.map((log, i) => {
      return (<TxLog style={{ width: '100%' }} log={log} key={i.toString()} />)
    })}
  </div>);
}

export default function E(): JSX.Element {
  const router = useRouter();
  const { address } = router.query;
  return (<MainApp>
    <EventAddress address={address as string}></EventAddress>
  </MainApp>)
}