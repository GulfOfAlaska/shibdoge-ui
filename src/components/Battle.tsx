import { MsgExecuteContract, MsgSend, StdFee } from '@terra-money/terra.js';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from '@terra-money/wallet-provider';
import { contractAddress } from 'constants/contractAddress';
import { useCallback, useState } from 'react';
import './componentStyle.css'
import battleground1 from '../assets/battleground1.png';
import battleground2 from '../assets/battleground2.png';
import { ChooseSideButton } from './ChooseSideButton';

export function Battle() {

  const connectedWallet = useConnectedWallet();

  return (
    <div style={
      { height: '100%', position: 'relative', display: 'flex', justifyContent: 'space-between' }
    }>
      {/* DOGE */}
      <div className='container' style={{ height: '100%', width: '49.5%', background: `url(${battleground1}) no-repeat`, backgroundSize: 'cover', }}>
        <div className='doge-pict-container' style={{ right: '1rem' }} />
        {/* {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ right: '.5rem' }}>
            <ChooseSideButton label={'Choose Doge'} side={1} />
          </div>
        )} */}
        {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
      </div>

      {/* <h1 style={{ fontFamily: 'Press Start 2p', textAlign: 'center', }}>VS</h1> */}
      <div className='vs-container' />

      {/* SHIBA */}
      <div className='container' style={{ height: '100%', width: '49.5%', background: `url(${battleground2}) no-repeat`, backgroundSize: 'cover', }}>
        <div className='shiba-pict-container' style={{ right: '1rem' }} />
        {/* {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ left: '.5rem' }}>
            <ChooseSideButton label={'Choose Shib'} side={2} />
          </div>
        )} */}
        {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
      </div>
    </div>
  );
}
