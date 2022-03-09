import { MainState } from "../../lib/MainApp/state";
import GnosisSDK, { ContractNetworksConfig } from '@gnosis.pm/safe-core-sdk';
import * as SS from '@gnosis.pm/safe-core-sdk/dist/src/utils/signatures/SafeSignature';

import { ethers } from 'ethers';
import { MainApp } from "../../lib/MainApp";
export default function GnosisUI() {
  // dev
  // const safeAddress = '0x08b6482B7e6c39dBfa00bd43B51D17B4D44b1AE4';
  // const firstSigner = '0x8DCbEeaf304Ab02d743c4D8410e0952c06dF2A03';
  
  // prod
  const safeAddress = '0xA70007e12538966a2e18F9B332D489b3C9DCBC43';
  const firstSigner = '0xb2d44e5ea830333abd20b769fad052bf13d40a41';
  const proxyFactory = { address: safeAddress };
  const onClick = async () => {
    const provider = await MainState.get('provider');
    if (!provider) { 
      console.log('no provider');
      return;
    }

    const getFirstSign = async (tx: (typeof txToSign)) => {
      // console.log(tx.data);
      const firstSignature = "0xb54289617f7f299fa19ca36668c150194d7dd9b45bae2f13c041210c8d2635865541d117d8b252a5eb2f408b3d04da31c9bb199ca153c264e9a43a845a9a01381f";
      /// withFirstPK
      // console.log('using privateKey');
      // const firstPk = '_';
      // const providerOrSigner = new ethers.Wallet(firstPk, provider);
      // const safe = await GnosisSDK.create({ ethers, safeAddress, providerOrSigner, contractNetworks }); 
      // await safe.signTransaction(tx);
      // console.log(Array.from(tx.signatures.values()));
      // return tx;
      
      // with firstSignature
      console.log(`using addSignature`);
      const signature = new SS.EthSafeSignature(firstSigner, firstSignature);
      tx.addSignature(signature);
      return tx;
    }

    const signer = provider.getSigner();
    const chainId = await signer.getChainId();
    const contractNetworks: any = { [chainId]: { multiSendAddress: proxyFactory.address } };
    const providerOrSigner = signer;
    const safe = await GnosisSDK.create({ ethers, safeAddress, providerOrSigner, contractNetworks });    
    const balance = await provider.getBalance(safeAddress);
    const to = '0x9829418BCE5676e3eF2D1bEF3307f284EEc09Ca7';
    const txToSign = await safe.createTransaction({ to, value: balance.toString(), data: '0x' });
    // await txToSign.addSignature(signature);
    await getFirstSign(txToSign);
    await safe.signTransaction(txToSign);
    console.log(JSON.stringify(txToSign.data));
    console.log(Array.from(txToSign.signatures.values()));
    // console.log(txToSign.encodedSignatures());
    // await safe.executeTransaction(txToSign);
  }
  return (<MainApp>
    <button onClick={onClick}>Sign</button>
  </MainApp>);
}

// using addSignature
// 0xd652dbaa4187e011c8f7811cc7e8fdee5f72aca4daa977b3bacfb6cc86037a0752c2ed6e22f745f8766c3b49dce82f4d104263764f44d28f6c9485f65d04b38320297e9fec4dd620645534aab5f2a710c3e8cf5804eee49e47b1389408e78dc2f63b29a1037529a6a3793d86ec8d99428a67852ddbc87c4f9da0a0f607b76dd12620
