import { NewNumber } from "@cryptoket/new-number";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { MainState } from "../../lib/MainApp/state";

function _GasCost(props: { gasCost: NewNumber.Ether }): JSX.Element {

  const onGasPriceChange = (value: string) => {
    MainState.set('gasPrice', NewNumber.multiplier(value));
  }

  const onETHPriceChange = (value: string) => {
    MainState.set('ethPrice', NewNumber.multiplier(value));
  }

  const gasPrice = MainState.get('gasPrice');
  const ethPrice = MainState.get('ethPrice');

  useEffect(() => {}, [gasPrice, ethPrice]);

  return (<div style={{ display: 'block', backgroundColor: 'burlywood', border: '1px black solid' }}>
    <div style={{ margin: '10px' }}>
      <div>Total Gas Cost: </div>
      <div>{props.gasCost.normalized().toFixed(8)}</div>
      <div style={{ display: 'flex', marginBottom: '10px'}}>
        <div style={{ marginRight: '10px' }}>
          Gas Price Multiplier:
        </div>
        <div>
          <input style={{ height: '30px', width: '50px'}} value={gasPrice.toString()} type={'number'} onChange={(e) => onGasPriceChange(e.target.value)} placeholder="1"></input>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '10px'}}>
          ETH Price Multiplier: 
        </div>
        <div>
          <input style={{ height: '30px', width: '50px'}} value={ethPrice.toString()} type={'number'} onChange={(e) => onETHPriceChange(e.target.value)} placeholder="1"></input>
        </div>
      </div>
      <div>
        {props.gasCost.multipliedBy(gasPrice).multipliedBy(ethPrice).toFixed(8)} $
      </div>

    </div>
  </div>);
}

export const GasCost = observer(_GasCost);