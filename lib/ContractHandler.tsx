import { NewNumber } from "@cryptoket/new-number";
import { ethers, providers } from "ethers";
import { _MainState } from "./MainApp/state";

interface IContractCache {
  name: string;
  contract: ethers.Contract;
}
class _ContractHandler {
  private cache = new Map<string, IContractCache>();

  async contractName(address: string, provider?: ethers.providers.BaseProvider): Promise<string> {
    const cc = await this._load(address);
    if (!provider) { return cc.name; }
    // if (typeof cc?.contract?.name === 'function') {
    //   const c = cc.contract.connect(provider);
    //   return c.name().catch((error: Error) => cc.name);
    // }
    return cc.name;
  }

  async contracts(provider: ethers.providers.BaseProvider): Promise<ethers.Contract[]> {
    const resp = await fetch('/api/contracts');
    const { knownAddress } = await resp.json();
    return Promise.all(knownAddress.map((ka: string) => this.load(ka, provider)));
  }

  async tokenBalances(provider: ethers.providers.BaseProvider, address: string): Promise<Array<{ address: string; unit: string; balance: NewNumber.Cash }>> {
    const tokens = await this.tokens(provider);
    const result: any[] = [];
    if (!address) { return []; }
    for (const t of tokens) {
      const bnBalance: ethers.BigNumber = await t.balanceOf(address).catch((error: Error) => {
        console.log(`error fetching balance for token: ${t.address} in account [${address}]`);
        throw error;
      });
      // console.log({ a, bnBalance });
      const decimal: number = await t.decimals();
      // console.log({ a, decimal });
      const unit: string = await t.name();
      // console.log({ a, unit });
      const nnBalance = new NewNumber.Numeric(bnBalance.toString(), -decimal, 10);
      const datum = { address: t.address, unit, balance: nnBalance.normalized() };
      if (nnBalance.gt(0)) {
        result.push(datum);
      }
    }
    return result;
  }

  async tokens(provider: ethers.providers.BaseProvider): Promise<ethers.Contract[]> {
    const contracts = await this.contracts(provider);
    return contracts
      .filter((x) => typeof x.balanceOf === 'function')
      .filter((x) => typeof x.decimals === 'function')
      .filter((x) => typeof x.name === 'function');
  }

  async load(address: string, provider?: ethers.providers.BaseProvider | ethers.Signer): Promise<ethers.Contract> {
    const c = await this._load(address);
    if (provider) {
      return c.contract.connect(provider);
    } else {
      return c.contract;
    }
  }

  private async _load(address: string): Promise<IContractCache> {
    const c = this.cache.get(address);
    if (c) { return c }
    const resp = await fetch(`/abis/${address}.json`);
    const { contractName, abi } = await resp.json();
    const contract = new ethers.Contract(address, abi);
    const cc = { name: contractName, contract }
    this.cache.set(address, cc);
    return cc;
  }
}

export const ContractHandler = new _ContractHandler();