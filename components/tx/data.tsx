import { ethers } from 'ethers';
import { EtherValue } from '../../lib/EtherValue';
export interface ITx {
  request: ethers.providers.TransactionResponse;
  receipt: ethers.providers.TransactionReceipt;
  contract?: ethers.Contract;
  errorMessage?: string;
}

export function TxData(tx: ITx): JSX.Element {
  const { contract, request } = tx;
  if (!contract) {
    return (<div>
        <div>data: </div>
        <div style={{ maxHeight: '100px', overflowY: 'scroll'}}>{request.data}</div>
    </div>);
  } else {
    try {
      const parsed = contract.interface.parseTransaction(request);
      return (<div>
        <div>data: </div>
        <div>
          <div style={{ textAlign: 'center' }}>{parsed.name}</div>
          {parsed.functionFragment.inputs.map((input, index) => {
            const value = parsed.args[index];
            return (<div key={`data-input-${index}`} style={{ display: 'flex'}}>
                <div style={{ minWidth: '150px', marginRight: '10px' }}>{input.name}</div>
                <EtherValue signature={parsed.signature} index={index} value={value} paramTypes={parsed.functionFragment.inputs} contractAddress={request.to as string}></EtherValue>
              </div>)
          })}
        </div>
      </div>); 
    } catch (error) {
      console.error(error);
      return (<div>
        <div>data: </div>
        <div style={{ maxHeight: '100px', overflowY: 'scroll'}}>{request.data}</div>
      </div>);
    }
  }
}