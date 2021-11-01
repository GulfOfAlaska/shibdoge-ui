import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { TxResult, useConnectedWallet } from '@terra-money/wallet-provider';
import { contractAddress } from 'constants/contractAddress';
import useInterval from 'hooks/useInterval';
import { useMemo, useState } from 'react';
import { Claim } from './Claim';
import './componentStyle.css'
import { SendDeposit } from './SendDeposit';
import { Withdraw } from './Withdraw';
import './componentStyle.css'
import BigNumber from 'bignumber.js';
import { ChooseSideButton } from './ChooseSideButton';

interface SideResponse {
  side: {
    current_winning_count: number,
    total_amount: number
  }
}

interface StakeResponse {
  stake: {
    amount: string,
    last_claimed_at: number,
    last_claimed_winning_count: number,
    reward_unclaimed: string,
    side: number
  }
}

interface LastRoundResponse {
  last_round: {
    block_height: number,
    round: number
  }
}

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [chosenSide, setChosenSide] = useState<null | StakeResponse>();
  const [dogeScore, setDogeScore] = useState<null | SideResponse>();
  const [shibaScore, setShibaScore] = useState<null | SideResponse>();
  const [lastRound, setLastRound] = useState<null | string>();
  const [lastRoundWinners, setLastRoundWinners] = useState<null | string>();

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

  async function getLastRound(): Promise<LastRoundResponse | undefined> {
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
        setChosenSide(side)
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
        setDogeScore(dogeScore)
        const shibaScore: SideResponse | undefined = await getSide(2)
        setShibaScore(shibaScore)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  useInterval(
    async () => {
      try {
        const lastRound: LastRoundResponse | undefined = await getLastRound()
        await fetch('https://fcd.terra.dev/blocks/latest').then(
          (res: any) => res.json()
        ).then((res: any) => {
          const currentBlockheight = res?.block?.header?.height
          console.log(lastRound, currentBlockheight)
          if (lastRound?.last_round?.block_height && currentBlockheight) {
            const timeBetweenRounds = parseInt(currentBlockheight) - lastRound?.last_round?.block_height
            const secondsBetweenRounds = timeBetweenRounds * 6
            console.log(secondsBetweenRounds)
            const minutes = Math.floor(secondsBetweenRounds / 60)
            const seconds = timeBetweenRounds - minutes * 60
            setLastRound(`${minutes}m : ${seconds}s`)
          }
        })
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

  const side = chosenSide?.stake?.side
  let chosenSideStr = 'None'
  if (side === 1) {
    chosenSideStr = 'Doge'
  } else if (side === 2) {
    chosenSideStr = 'Shiba'
  }

  return (
    <div style={{ height: '100%', textAlign: 'left' }}>
      <div className='container' style={{ height: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div><h4 className='text'>DOGE</h4></div>
          <div className='text'>Score: {dogeScore?.side?.total_amount}</div>
          <div className='text'>Win counts: {dogeScore?.side?.current_winning_count}</div>
          <ChooseSideButton label={'Choose Doge'} side={2} />
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div className='text'>Your choice: {side}</div>
          <div className='text'>Last round: {lastRound}</div>
          <div className='text'>Previous winners: {lastRoundWinners}</div>
          <SendDeposit chosenSide={side ?? 0} />
          <Withdraw />
          <Claim />
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div><h4 className='text'>SHIBA</h4></div>
          <div className='text'>Score: {shibaScore?.side?.total_amount}</div>
          <div className='text'>Win counts: {shibaScore?.side?.current_winning_count}</div>
          <ChooseSideButton label={'Choose Shib'} side={2} />
        </div>
      </div>
    </div>
  );
}
