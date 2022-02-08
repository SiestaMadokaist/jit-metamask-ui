import { ethers } from "ethers";
import { InputHTMLAttributes, useEffect, useState } from "react";
import React from 'react';
import { MainState } from "../../lib/MainApp/state";
import { EtherValue } from '../../lib/EtherValue';
import styles from './view.module.css';
import { SimpleValue } from "../../lib/SimpleValue";
import { NewNumber } from "@cryptoket/new-number";
export interface ITxCall {
  f: ethers.utils.FunctionFragment;
  contract?: ethers.Contract;
}

export function InputField(props: { input: ethers.utils.ParamType; onChange: (v: unknown) => void }): JSX.Element {
  const placeholder = props.input.name ? `${props.input.name}: ${props.input.type}` : `${props.input.type}`;
  const extra = (refObject: React.RefObject<unknown>) => {
    if (!props.input.type.startsWith('uint')) {
      return (<div></div>);
    } else {
      const onClick = (pow: number) => {
        return () => {
          const multiplier = ethers.BigNumber.from(10).pow(pow);
          const current = refObject.current as HTMLInputElement;
          const value = current.value.trim() === '' ? '1' : current.value;
          const original = ethers.BigNumber.from(value ?? '1');
          current.value = original.mul(multiplier).toString();
          props.onChange(current.value);
        }
      }
      return (<div className={styles.buttonWrapper}>
        <button onClick={onClick(6)}>6</button>
        <button onClick={onClick(9)}>9</button>
        <button onClick={onClick(18)}>18</button>
      </div>);
    }
  }

  const ref = React.createRef<HTMLInputElement>();
  const type = (): InputHTMLAttributes<HTMLInputElement>['type'] => {
    const s = props.input.type;
    if (s.startsWith('uint')) { return 'number'; }
    if (s === 'bool') { return 'checkbox'; }
  }

  if (type() !== 'checkbox') {
    return (<div style={{ display: 'flex', marginBottom: '5px' }}>
      <div style={{ width: '100%', marginTop: '5px' }}>
        {extra(ref)}
        <input style={{ minWidth: '100%', height: '30px', }} ref={ref} placeholder={placeholder} onChange={(event) => props.onChange(event.target.value)}></input>
      </div>
    </div>);
  } else {
    return (<div>
      <div style={{ width: '100%', marginTop: '5px', display: 'flex' }}>
        <div style={{ width: '30%'}}>{props.input.name}</div>
        <div>
        <input type={type()} style={{ height: '30px', width: '2em' }} ref={ref} onChange={(event) => { props.onChange(ref.current?.checked)}}></input>
        </div>
      </div>
    </div>)
  }

}

interface IOutputField {
  value?: string | ethers.BigNumber | unknown[];
  f: ethers.utils.FunctionFragment;
}
export function OutputField<V>(props: IOutputField): JSX.Element {
  const outputs = props.f.outputs ?? [];
  if (outputs.length === 1) {
    return (<div>
      <SimpleValue value={props.value as string} type={outputs[0].type}></SimpleValue>
    </div>);
  } else {
    const values = (props.value ?? []) as string[];
    return (<div>
      {outputs.map((o, i) => {
        return (
          <div key={`${i}`} style={{ display: 'flex'}}>
            <div style={{ minWidth: '300px', marginRight: '10px'}}>{outputs[i].name}</div>
            <div>
            <SimpleValue value={values[i] ?? ''} type={outputs[i].type}/>
            </div>
          </div>
        )
      })}
    </div>);
  }
}

export function TxCall(props: ITxCall): JSX.Element {
  const { f, contract } = props; 
  const [returnValue, setReturnValue] = useState<any>();
  const [inputs, setInputs] = useState<unknown[]>([]);
  const call = async () => {
    if (!contract) { return; }
    if (f.constant) {
      const v = await contract[f.name](...inputs);
      console.log({ v, inputs });
      setReturnValue(v);  
    } else {
      const provider = MainState.get('provider');
      if (!provider) { return; }
      if (f.stateMutability !== 'payable') {
        const tx = await contract.populateTransaction[f.name](...inputs);
        const signer = provider.getSigner();
        await signer.sendTransaction({ ...tx, gasLimit: 1500_000 });  
      } else {
        const value = prompt('ETH Value');
        if (!value) { return; }
        const tx = await contract.populateTransaction[f.name](...inputs);
        const signer = provider.getSigner();
        const weiValue = NewNumber.ether(value).liftTo(NewNumber.wei).integerValue().toString();
        await signer.sendTransaction({ value: ethers.BigNumber.from(weiValue), ...tx, gasLimit: 1500_000 });  
      }
    }
  };
  useEffect(() => {
    if (!f.constant) { return; }
    if (f.inputs.length > 0) { return; }
    (async () => {
      call();
    })();
  }, [f.constant, f.inputs.length]);

  const submitButton = (name: string) => {
    return (<div>
      <button onClick={call} style={{ width: '100%', height: '30px', fontSize: '1.1em' }}>{name}</button>
    </div>);
  }
  return (<div style={{ margin: '10px', marginBottom: '20px', borderBottom: '3px black solid', backgroundColor: 'cornsilk' }}>
    <div style={{ margin: '5px' }}>
      <div>
        {f.inputs.map((input, index) => {
          const onChange = (v: unknown) => {
            const next = [...inputs];
            if (input.type.startsWith('uint')) {
              next[index] = ethers.BigNumber.from(v);
            } else {
              try {
                next[index] = JSON.parse(v as string);
              } catch (error) {
                next[index] = v;
              }  
            };
            setInputs(next);
          }
          return (<InputField key={input.name} input={input} onChange={onChange}></InputField>);
        })}
      </div>
      <div>
        {f.name}({f.inputs.map(i => i.type).join(',')})
      </div>
      {submitButton(`${f.name}`)}
      <OutputField value={returnValue} f={props.f}></OutputField>
    </div>
  </div>);
}