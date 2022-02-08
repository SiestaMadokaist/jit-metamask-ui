import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ContractHandler } from "./ContractHandler";
import { InternalLink } from "./InternalLink";
import { MainState } from "./MainApp/state";
import { NewNumber } from '@cryptoket/new-number';
type BuiltInType = 'address' | 'number' | 'bytes';
type AsType = BuiltInType | 'amountOf';
interface As<T extends AsType> {
  type: T;
}

interface AsAmountOf extends As<'amountOf'> {
  token: string;
}

interface IEtherValueBase {
  key?: string;
  index: number;
  contractAddress: string;
  paramTypes: ethers.utils.ParamType[];
  signature: string;
}

interface IEtherAddress extends IEtherValueBase {
  value: string;
}

interface IEtherUint extends IEtherValueBase {
  value: ethers.BigNumber;
}

interface IEtherBytes extends IEtherValueBase {
  value: string;
}

enum SIGNATURE {
  LOG_TRANSFER = 'Transfer(address,address,uint256)',
  LOG_APPROVE = 'Approval(address,address,uint256)',
  TX_MINT = 'mint(address,uint256)',
  TX_TRANSFER = 'transfer(address,uint256)',
}

type IEtherValue = IEtherBytes | IEtherAddress | IEtherUint;

const isTokenAmount = (props: IEtherValue): boolean => {
  if (props.signature === SIGNATURE.LOG_TRANSFER) {
    if (props.index === 2) { return true; }
  } else if (props.signature === SIGNATURE.TX_MINT) {
    if (props.index === 1) { return true; }
  } else if (props.signature === SIGNATURE.TX_TRANSFER) {
    if (props.index === 1) { return true; }
  } else if (props.signature === SIGNATURE.LOG_APPROVE) {
    if (props.index === 2) { return true; }
  }
  return false;
}

export function EtherValue(props: IEtherValue): JSX.Element {
  const [info, setInfo] = useState<{ decimals: number; name: string; }>();
  useEffect(() => {
    (async () => {
      let _contract = await ContractHandler.load(props.contractAddress).catch(() => ContractHandler.load('ierc20'));
      const provider = MainState.get('provider');
      if (provider) {
        _contract = _contract.connect(provider);
      }
      const decimals = await _contract.decimals().catch(() => undefined);
      const name = await _contract.name().catch(() => undefined);
      setInfo({ decimals, name });
    })().catch((error) => {
      console.error(error);
    })
  }, [props.contractAddress]);
  const { type } = props.paramTypes[props.index];
  if (type === 'address') {
    const value = props.value as string;
    return (<InternalLink type="address" value={value}></InternalLink>)
  } else if (type === 'bytes') {
    return (<span key={props.key}>{props.value}</span>);
  } else {
    if (!info?.decimals) {
      return (<span key={props.key}>{props.value.toString()}</span>);
    } else {
      const value = props.value as ethers.BigNumber;
      if (isTokenAmount(props)) {
        const v = new NewNumber.Numeric(value.toString(), -info.decimals, 10);
        return (<span key={props.key}>{v.normalized().toFixed(8)} {info.name}</span>)
      } else if (value instanceof Array) {
        return (<pre>{JSON.stringify(value, null, 2)}</pre>)
      } else {
        return (<span key={props.key}>{value.toString()}</span>);
      }
    }
  }
}