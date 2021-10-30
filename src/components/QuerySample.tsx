import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { contractAddress } from 'constants/contractAddress';
import useInterval from 'hooks/useInterval';
import { useMemo, useState } from 'react';
import { Claim } from './Claim';
import './componentStyle.css'
import { SendDeposit } from './SendDeposit';
import { Withdraw } from './Withdraw';
import './componentStyle.css'

interface SideResponse {
  side: {
    current_winning_count: number,
    total_amount: number
  }
}

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [chosenSide, setChosenSide] = useState<null | string>();
  const [dogeScore, setDogeScore] = useState<null | string>();
  const [shibaScore, setShibaScore] = useState<null | string>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  async function getChosenSide(address: string): Promise<any | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { stake: { address } }
    )
  }

  async function getScore(side: number): Promise<SideResponse | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { side: { side } }
    )
  }

  useInterval(
    async () => {
      // try {
      //   if (!connectedWallet?.terraAddress) return
      //   const side= (await getChosenSide(connectedWallet?.terraAddress.toString()))
      //   if (!side?.side) {
      //     return
      //   }
      //   if (side.side === 1) {
      //     setChosenSide('doge')
      //   }
      //   if (side?.side === 2) {
      //     setChosenSide('shiba')
      //   }
      // } catch (err) {
      //   console.error(err)
      // }

      try {
        const dogeScore: SideResponse | undefined = await getScore(1)
        setDogeScore(`Winning count: ${dogeScore?.side?.current_winning_count} Current count: ${dogeScore?.side?.total_amount}`)
        const shibaScore: SideResponse | undefined = await getScore(2)
        setShibaScore(`Winning count: ${shibaScore?.side?.current_winning_count} Current count: ${shibaScore?.side?.total_amount}`)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  return (
    <div style={{ height: '100%' }}>
      <div className='container' style={{ height: '100%' }}>
        <div className='text'>Your Champion: {chosenSide ? chosenSide : 'none'}</div>
        <div className='text'>Doge score: {dogeScore}</div>
        <div className='text'>Shiba score: {shibaScore}</div>
        {!connectedWallet && <p>Wallet not connected!</p>}
        <SendDeposit />
        <Withdraw />
        <Claim />
      </div>
    </div>
  );
}
