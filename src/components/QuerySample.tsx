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
import BigNumber from 'bignumber.js';

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
  const [lastRound, setLastRound] = useState<null | string>();
  const [lastRoundWInners, setLastRoundWinners] = useState<null | string>();

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

  async function getSide(side: number): Promise<SideResponse | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { side: { side } }
    )
  }

  async function getLastRound(): Promise<any> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { last_round: {} }
    )
  }

  async function getLastRoundWinners(): Promise<any> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { last_round_winners: {} }
    )
  }

  useInterval(
    async () => {
      try {
        if (!connectedWallet?.terraAddress) return
        const side = (await getChosenSide(connectedWallet?.terraAddress.toString()))
        console.log(side)
        if (side.side === 1) {
          setChosenSide('doge')
        }
        if (side?.side === 2) {
          setChosenSide('shiba')
        }
      } catch (err) {
        console.error(err)
      }
    },
    3000,
  )

  useInterval(
    async () => {
      try {
        const dogeScore: SideResponse | undefined = await getSide(1)
        setDogeScore(`Winning count: ${dogeScore?.side?.current_winning_count} Current count: ${dogeScore?.side?.total_amount}`)
        const shibaScore: SideResponse | undefined = await getSide(2)
        setShibaScore(`Winning count: ${shibaScore?.side?.current_winning_count} Current count: ${shibaScore?.side?.total_amount}`)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  useInterval(
    async () => {
      try {
        const lastRound: any = await getLastRound()
        console.log(lastRound)
        // await fetch('https://fcd.terra.dev/blocks/latest').then(
        //   (res: any) => res.json()
        // ).then((res: any) => {
        //   const currentBlockheight = res?.block?.header?.height
        //   console.log(currentBlockheight, lastRound)
        //   if (lastRound && currentBlockheight) {
        //     // new BigNumber(las)
        //     setLastRound(JSON.stringify(lastRound))
        //   }
        // })
      } catch (err) {
        console.error(err)
      }

    },
    1000,
  )

  useInterval(
    async () => {
      try {
        const lastRoundWinners: any = await getLastRoundWinners()
        setLastRoundWinners(JSON.stringify(lastRoundWinners))
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
        <div className='text'>Last Round: {shibaScore}</div>
        <div className='text'>Previous Round Winners: {shibaScore}</div>
        <SendDeposit />
        <Withdraw />
        <Claim />
      </div>
    </div>
  );
}
