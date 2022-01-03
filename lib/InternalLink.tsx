import { useEffect, useState } from "react";
import { ContractHandler } from "./ContractHandler";
import { MainState } from "./MainApp/state";

interface IInternalLink {
  type: 'address' | 'tx';
  value: string;
  name?: string;
}

export function InternalLink(props: IInternalLink): JSX.Element {
  const [name, setName] = useState<string>(props.name ?? props.value);
  useEffect(() => {
    if (props.type !== 'address') { return; }
    (async () => {
      const provider = await MainState.get('provider');
      const contractName = await ContractHandler.contractName(props.value, provider)
        .catch((error) => {});
      if (contractName) {
        setName(`${contractName}`);
      }
    })();
  }, [props]);
  const n = () => {
    if (name === '') { return props.type; }
    return name ?? props.value;
  };
  if (name !== props.value) {
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: '150px' }}>
          <a href={`/${props.type}/${props.value}`}>{n()}</a>
        </div>
        <div style={{ margin: '3px' }}>-</div>
        <div>{props.type === 'address' ? props.value : ''}</div>
      </div>
    );
  } else {
    return (<div>
      <a href={`/${props.type}/${props.value}`}>{props.type}:</a>
      <span> {props.value}</span>
    </div>)
  }

}