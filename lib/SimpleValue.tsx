import { ethers } from "ethers";
import { useEffect, useState, createRef } from "react";
import { ContractHandler } from "./ContractHandler";
import { InternalLink } from "./InternalLink";
import { MainState } from "./MainApp/state";
import { NewNumber } from '@cryptoket/new-number';

// type BuiltInType = 'address' | 'number' | 'bytes';
// type AsType = BuiltInType | 'amountOf';
// interface As<T extends AsType> {
//   type: T;
// }

// interface AsAmountOf extends As<'amountOf'> {
//   token: string;
// }


interface IEtherAddress {
  type: 'address' | string;
  value?: string;
}

interface IEtherUint {
  type: 'uint' | 'uint256';
  value?: ethers.BigNumber;
}

interface IEtherBytes {
  type: 'bytes';
  value?: string;
}

enum SIGNATURE {
  LOG_TRANSFER = 'Transfer(address,address,uint256)',
  TX_MINT = 'mint(address,uint256)',
  TX_TRANSFER = 'transfer(address,uint256)',
}

type IEtherValue = { key?: string; } & (IEtherBytes | IEtherAddress | IEtherUint);

export function SimpleValue(props: IEtherValue): JSX.Element {
  const { type, value } = props;
  const [decimal, setDecimal] = useState<number>(0);
  if (!value) {
    return (<div></div>);
  } else if (type === 'address') {
    const value = props.value as string;
    return (<InternalLink type="address" value={value}></InternalLink>)
  } else if (type === 'bytes') {
    return (<span>{props.value}</span>);
  } else if (type.startsWith('uint')) {
    const value = props.value as ethers.BigNumber;
    const v = new NewNumber.Numeric(value.toString(), decimal, 10);
    const ref = createRef<HTMLInputElement>();
    const onFocus = () => {
      const d = -18;
      setDecimal(d);
      if (ref.current) {
        ref.current.value = d.toString();
      }
    }
    const isFloat = !v.normalized().mod(1).eq(0);
    const fixPoint = isFloat ? 6 : 0;
    return (<div style={{ display: 'flex', marginTop: '5px'}}>
      <div style={{ marginRight: '10px' }}>D: </div>
      <div style={{ marginRight: '10px' }}>
        <input ref={ref} onFocus={onFocus} style={{ width: '50px', height: '30px' }} type='number' onChange={(e) => setDecimal(parseInt(e.target.value, 10))}></input>
      </div>
      <div>{v.normalized().toFixed(fixPoint)}</div>
    </div>)
  } else {
    return (<span>{props.value?.toString()}</span>) 
  }
}