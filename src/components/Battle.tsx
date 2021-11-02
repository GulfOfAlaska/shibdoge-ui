import { LCDClient, MsgExecuteContract, MsgSend, StdFee } from '@terra-money/terra.js';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from '@terra-money/wallet-provider';
import { useCallback, useMemo, useState } from 'react';
import './componentStyle.css'
import useInterval from 'hooks/useInterval';
import { SideResponse } from './QuerySample';
import { contractAddress } from 'constants/contractAddress';
import BigNumber from 'bignumber.js';
import fight from '../assets/fight.mp4';
import dogeWin from '../assets/doge-win.mp4';
import shibaWin from '../assets/shiba-win.mp4';

export function Battle() {

  const connectedWallet = useConnectedWallet();
  const [dogeScore, setDogeScore] = useState<null | SideResponse>();
  const [shibaScore, setShibaScore] = useState<null | SideResponse>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  async function getSide(side: number): Promise<SideResponse | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { side: { side } }
    )
  }

  const dogeWinningCountStr = dogeScore?.side?.current_winning_count ? new BigNumber(dogeScore?.side?.current_winning_count) : new BigNumber(0)
  const shibaWinningCountStr = shibaScore?.side?.current_winning_count ? new BigNumber(shibaScore?.side?.current_winning_count) : new BigNumber(0)

  let image = fight
  if (dogeWinningCountStr.gt(shibaWinningCountStr)) image = shibaWin
  if (dogeWinningCountStr.lt(shibaWinningCountStr)) image = dogeWin

  useInterval(
    async () => {
      try {
        const dogeScore: SideResponse | undefined = await getSide(1)
        setDogeScore(dogeScore)
        const shibaScore: SideResponse | undefined = await getSide(2)
        setShibaScore(shibaScore)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  return (
    <div style={
      { height: '100%', position: 'relative', display: 'flex', justifyContent: 'space-between' }
    }>
      {/* DOGE */}
      {/* <div className='container' style={{ height: '100%', width: '100%', background: `url(${battle}) no-repeat`, backgroundSize: '100% 100%', }}> */}
      <div  style={{ height: '100%', width: '100%' }}>
        <video autoPlay muted loop width='100%' height='100%' style={{objectFit: 'fill'}}>
          <source src={image} type="video/mp4" />
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
