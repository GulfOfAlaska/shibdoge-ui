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

interface LastRoundWinnersResponse {
  round_winners: number[]
}

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [chosenSide, setChosenSide] = useState<null | StakeResponse>();
  const [dogeScore, setDogeScore] = useState<null | SideResponse>();
  const [shibaScore, setShibaScore] = useState<null | SideResponse>();
  const [secondsBetweenRounds, setSecondsBetweenRounds] = useState<null | BigNumber>();
  const [lastRoundWinners, setLastRoundWinners] = useState<null | LastRoundWinnersResponse>();

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

  async function getLastRoundWinners(): Promise<LastRoundWinnersResponse | undefined> {
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
      } catch (err) {
        console.error(err)
      }
    }, 1000
  )

  useInterval(
    async () => {
      try {
        const lastRound: LastRoundResponse | undefined = await getLastRound()
        const blockInfo = await lcd?.tendermint.blockInfo()
        const currentBlockheight = blockInfo?.block?.header?.height

        if (lastRound?.last_round?.block_height && currentBlockheight) {
          const blocksBetweenRounds = parseInt(currentBlockheight) - lastRound?.last_round?.block_height
          const secondsBetweenRounds = blocksBetweenRounds * 5
          setSecondsBetweenRounds(new BigNumber(secondsBetweenRounds))
        }

      } catch (err) {
        console.error(err)
      }

    },
    60000,
  )

  useInterval(
    async () => {
      try {
        if (secondsBetweenRounds) {
          setSecondsBetweenRounds(secondsBetweenRounds.plus(1))
        } else {
          const lastRound: LastRoundResponse | undefined = await getLastRound()
          const blockInfo = await lcd?.tendermint.blockInfo()
          const currentBlockheight = blockInfo?.block?.header?.height

          if (lastRound?.last_round?.block_height && currentBlockheight) {
            const blocksBetweenRounds = parseInt(currentBlockheight) - lastRound?.last_round?.block_height
            const secondsBetweenRounds = blocksBetweenRounds * 5
            setSecondsBetweenRounds(new BigNumber(secondsBetweenRounds))
          }
        }
      } catch (err) {
        console.error(err)
      }
    }, 1000
  )

  useInterval(
    async () => {
      try {
        const lastRoundWinners: LastRoundWinnersResponse | undefined = await getLastRoundWinners()
        setLastRoundWinners(lastRoundWinners)
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


  const dogeTotalAmountStr = dogeScore?.side?.total_amount ? new BigNumber(dogeScore?.side?.total_amount).shiftedBy(-6).toString() : '-'
  const shibaTotalAmountStr = shibaScore?.side?.total_amount ? new BigNumber(shibaScore?.side?.total_amount).shiftedBy(-6).toString() : '-'
  const dogeWinningCountStr = dogeScore?.side?.current_winning_count ? new BigNumber(dogeScore?.side?.current_winning_count).toString() : '-'
  const shibaWinningCountStr = shibaScore?.side?.current_winning_count ? new BigNumber(shibaScore?.side?.current_winning_count).toString() : '-'
  const stakedAmountStr = chosenSide?.stake.amount ? new BigNumber(chosenSide?.stake.amount).shiftedBy(-6).toString() : '-'

  // Timer
  const remainingTimeSec = secondsBetweenRounds ? new BigNumber(60).minus(secondsBetweenRounds) : null
  BigNumber.set({ ROUNDING_MODE: 3 })
  let minutes = remainingTimeSec ? remainingTimeSec?.div(new BigNumber(60)) : null
  let seconds = minutes ? remainingTimeSec?.mod(new BigNumber(60)) : null
  minutes = minutes?.isNegative() ? new BigNumber(0) : minutes
  seconds = seconds?.isNegative() ? new BigNumber(0) : seconds
  const remainingTimeText = (minutes && seconds && !minutes.isNaN() && !seconds.isNaN()) ? `${minutes.toFixed(0)}m : ${seconds.toFixed(0)}s` : '-'

  let dogeWins = 0
  let shibaWins = 0
  lastRoundWinners?.round_winners.forEach((winner) => {
    if (winner === 1) dogeWins += 1
    if (winner === 2) shibaWins += 1
  })
  const lastWinnersStr = `Doge: ${dogeWins} Shiba: ${shibaWins}`

  return (
    <div style={{ height: '100%', textAlign: 'left' }}>
      <div className='container' style={{ height: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div><h2 className='text'>DOGE</h2></div>
          <div className='text' style={{ marginTop: '1rem' }}>Total Votes: {dogeTotalAmountStr}</div>
          <div className='text'>Win counts: {dogeWinningCountStr}</div>
          {side !== 1 && <ChooseSideButton label={'Choose Doge'} side={1} />}
          {side === 1 && <div className='text'>{`Staked: ${stakedAmountStr}`}</div>}
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className='text' style={{ marginBottom: '.5rem' }}>Your choice: {chosenSideStr}</div>
          <div className='text' style={{ marginBottom: '.5rem' }}>{`Time left: ${remainingTimeText}`}</div>
          <div className='text' style={{ marginBottom: '.5rem' }}>Previous winners: {lastWinnersStr}</div>
          <div className='text' style={{ marginBottom: '.5rem' }}><SendDeposit chosenSide={side ?? 0} /></div>
          <div className='text' style={{ marginBottom: '.5rem' }}><Withdraw /></div>
          <Claim chosenSide={side ?? 0} unclaimedMessage={`Unclaimed: ${chosenSide?.stake.reward_unclaimed} dogeshib`} />
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div><h2 className='text'>SHIBA</h2></div>
          <div className='text' style={{ marginTop: '1rem' }}>Total Votes: {shibaTotalAmountStr}</div>
          <div className='text'>Win counts: {shibaWinningCountStr}</div>
          {side !== 2 && <ChooseSideButton label={'Choose Shib'} side={2} />}
          {side === 2 && <div className='text'>{`Staked: ${stakedAmountStr}`}</div>}
        </div>
      </div>
    </div>
  );
}
