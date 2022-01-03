import { ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
interface IState {
  rpcURL?: string;
  provider?: ethers.providers.Web3Provider;
  signerAddress?: string;
  rpcProvider?: ethers.providers.JsonRpcProvider;
  title?: string;
}

export class _MainState {
  
  private state: IState = {
    provider: undefined,
    signerAddress: undefined,
    title: undefined,
    rpcProvider: new ethers.providers.JsonRpcProvider('http://localhost:7000'),
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