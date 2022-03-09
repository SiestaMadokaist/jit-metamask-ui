import { NewNumber } from '@cryptoket/new-number';
import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
interface IState {
  rpcURL?: string;
  provider?: ethers.providers.Web3Provider;
  signerAddress?: string;
  rpcProvider?: ethers.providers.JsonRpcProvider;
  title?: string;
  gasPrice: NewNumber.Multiplier;
  ethPrice: NewNumber.Multiplier;
}

export class _MainState {
  
  private state: IState = {
    provider: undefined,
    signerAddress: undefined,
    title: undefined,
    // rpcProvider: new ethers.providers.JsonRpcProvider('http://localhost:7000'),
    // rpcProvider: new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/a845bcb81c074920bd0f420b3eaf22c8'),
    rpcProvider: new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org'),
    gasPrice: NewNumber.multiplier(1),
    ethPrice: NewNumber.multiplier(1),
  };

  constructor() {
    makeAutoObservable(this.state);
  }

  set<K extends (keyof IState)>(key: K, value: IState[K]): void {
    this.state[key] = value;
  }

  get<K extends (keyof IState)>(k: K): IState[K] {
    return this.state[k];
  }
}

export const MainState = new _MainState();