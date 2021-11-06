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
import { Box } from '@mui/system';

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

  const dogeTotalAmount = dogeScore?.side?.total_amount ? new BigNumber(dogeScore?.side?.total_amount) : new BigNumber(0)
  const shibaTotalAmount = shibaScore?.side?.total_amount ? new BigNumber(shibaScore?.side?.total_amount) : new BigNumber(0)
  const winningSide = dogeTotalAmount.lt(shibaTotalAmount) ? 1 : 2

  console.log(winningSide === 2)

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
    <Box>
      {/* DOGE */}
      {/* <div className='container' style={{ height: '100%', width: '100%', background: `url(${battle}) no-repeat`, backgroundSize: '100% 100%', }}> */}
      <Box>
        {
          winningSide === 2 &&
          <video autoPlay muted loop width='100%' height='100%' style={{ objectFit: 'fill' }}>
            <source src={shibaWin} type="video/mp4" />
          </video>
        }
        {
          winningSide !== 2 &&
          <video autoPlay muted loop width='100%' height='100%' style={{ objectFit: 'fill' }}>
            <source src={dogeWin} type="video/mp4" />
          </video>
        }
      </Box>
    </Box>
  );
}
