import { NewNumber } from "@cryptoket/new-number";
import { useState } from "react";

export function GasCost(props: { gasCost: NewNumber.Ether }): JSX.Element {
  const [gasPrice, setGasPrice] = useState<NewNumber.Multiplier>(NewNumber.multiplier(1));
  const [ethPrice, setETHPrice] = useState<NewNumber.Multiplier>(NewNumber.multiplier(1));

  const onGasPriceChange = (value: string) => {
    setGasPrice(NewNumber.multiplier(value));
  }

  const onETHPriceChange = (value: string) => {
    setETHPrice(NewNumber.multiplier(value));
  }
  return (<div style={{ display: 'block', backgroundColor: 'burlywood', border: '1px black solid' }}>
    <div style={{ margin: '10px' }}>
      <div>Total Gas Cost: </div>
      <div>{props.gasCost.normalized().toFixed(8)}</div>
      <div style={{ display: 'flex', marginBottom: '10px'}}>
        <div style={{ marginRight: '10px' }}>
          Gas Price Multiplier:
        </div>
        <div>
          <input style={{ height: '30px', width: '50px'}} defaultValue={1} type={'number'} onChange={(e) => onGasPriceChange(e.target.value)} placeholder="gas price multiplier:"></input>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '10px'}}>
          ETH Price Multiplier: 
        </div>
        <div>
          <input style={{ height: '30px', width: '50px'}} defaultValue={1} type={'number'} onChange={(e) => onETHPriceChange(e.target.value)} placeholder="eth price multiplier:"></input>
        </div>
      </div>
      <div>
        {props.gasCost.multipliedBy(gasPrice).multipliedBy(ethPrice).toFixed(8)} $
      </div>

    </div>
  </div>);
}