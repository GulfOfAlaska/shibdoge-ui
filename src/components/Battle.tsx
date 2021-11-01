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
import { useCallback, useState } from 'react';
import './componentStyle.css'
import dogeFight from '../assets/doge-fight.mp4';

export function Battle() {

  const connectedWallet = useConnectedWallet();

  return (
    <div style={
      { height: '100%', position: 'relative', display: 'flex', justifyContent: 'space-between' }
    }>
      {/* DOGE */}
      {/* <div className='container' style={{ height: '100%', width: '100%', background: `url(${battle}) no-repeat`, backgroundSize: '100% 100%', }}> */}
      <div  style={{ height: '100%', width: '100%' }}>
        <video autoPlay muted loop width='100%' height='100%' style={{objectFit: 'fill'}}>
          <source src={dogeFight} type="video/mp4" />
        </video>
        {/* <div className='doge-pict-container' style={{ right: '1rem' }} /> */}
        {/* {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ right: '.5rem' }}>
            <ChooseSideButton label={'Choose Doge'} side={1} />
          </div>
        )} */}
        {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
      </div>

      {/* SHIBA */}
      {/* <div className='container' style={{ height: '100%', width: '49.5%', background: `url(${battleground2}) no-repeat`, backgroundSize: 'cover', }}>
        <div className='shiba-pict-container' style={{ right: '1rem' }} /> */}
      {/* {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ left: '.5rem' }}>
            <ChooseSideButton label={'Choose Shib'} side={2} />
          </div>
        )} */}
      {/* {!connectedWallet && <p>Wallet not connected!</p>} */}
      {/* </div> */}
    </div>
  );
}
