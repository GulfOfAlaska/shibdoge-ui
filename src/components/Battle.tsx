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

export function Battle() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [depositDogeAmount, setDepositDogeAmount] = useState<string | null>(null);
  const [depositShibaAmount, setDepositShibaAmount] = useState<string | null>(null);

  const connectedWallet = useConnectedWallet();

  const sendChoice = useCallback((side: number) => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { side: { side } }
    );

    connectedWallet
      .post({
        msgs: [execute],
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setTxError('User Denied');
        } else if (error instanceof CreateTxFailed) {
          setTxError('Create Tx Failed: ' + error.message);
        } else if (error instanceof TxFailed) {
          setTxError('Tx Failed: ' + error.message);
        } else if (error instanceof Timeout) {
          setTxError('Timeout');
        } else if (error instanceof TxUnspecifiedError) {
          setTxError('Unspecified Error: ' + error.message);
        } else {
          setTxError(
            'Unknown Error: ' +
            (error instanceof Error ? error.message : String(error)),
          );
        }
      });
  }, [connectedWallet]);

  const sendDeposit = useCallback((side: number) => {
    if (!connectedWallet) {
      return;
    }

    setTxResult(null);

    const execute = new MsgExecuteContract(
      connectedWallet.terraAddress,
      contractAddress,
      { deposit: { side } }
    );

    connectedWallet
      .post({
        msgs: [execute],
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setTxError('User Denied');
        } else if (error instanceof CreateTxFailed) {
          setTxError('Create Tx Failed: ' + error.message);
        } else if (error instanceof TxFailed) {
          setTxError('Tx Failed: ' + error.message);
        } else if (error instanceof Timeout) {
          setTxError('Timeout');
        } else if (error instanceof TxUnspecifiedError) {
          setTxError('Unspecified Error: ' + error.message);
        } else {
          setTxError(
            'Unknown Error: ' +
            (error instanceof Error ? error.message : String(error)),
          );
        }
      });
  }, [connectedWallet]);

  return (
    <div style={
      { height: '100%', position: 'relative', display: 'flex', justifyContent: 'space-between' }
    }>
      {/* DOGE */}
      <div className='container' style={{ height: '100%', width: '49.5%', background: `url(${battleground1}) no-repeat`, backgroundSize: 'cover', }}>
        <div className='doge-pict-container' style={{ right: '1rem' }} />
        {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ right: '.5rem' }}>
            <div className='button' onClick={() => sendChoice(0)}>Choose Doge</div>
          </div>
        )}
        {!connectedWallet && <p>Wallet not connected!</p>}
      </div>

      {/* <h1 style={{ fontFamily: 'Press Start 2p', textAlign: 'center', }}>VS</h1> */}
      <div className='vs-container' />

      {/* SHIBA */}
      <div className='container' style={{ height: '100%', width: '49.5%', background: `url(${battleground2}) no-repeat`, backgroundSize: 'cover', }}>
        <div className='shiba-pict-container' style={{ right: '1rem' }} />
        {connectedWallet?.availablePost && !txResult && !txError && (
          <div className='button-container' style={{ left: '.5rem' }}>
            <div className='button' onClick={() => sendChoice(1)}>Choose Shib</div>
          </div>
        )}
        {!connectedWallet && <p>Wallet not connected!</p>}
      </div>
    </div>
  );
}
