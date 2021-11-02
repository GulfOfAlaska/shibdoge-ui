import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { TxResult, useConnectedWallet } from '@terra-money/wallet-provider';
import { contractAddress } from 'constants/contractAddress';
import useInterval from 'hooks/useInterval';
import { useEffect, useMemo, useState } from 'react';
import { Claim } from './Claim';
import './componentStyle.css'
import { SendDeposit } from './SendDeposit';
import { Withdraw } from './Withdraw';
import './componentStyle.css'
import BigNumber from 'bignumber.js';
import { ChooseSideButton } from './ChooseSideButton';
import ShibLogo from 'assets/shiba-logo.png'
import DogeLogo from 'assets/doge-logo.png'

export interface SideResponse {
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

interface PendingRewardsResponse {
  pending_rewards: string
}

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [chosenSide, setChosenSide] = useState<null | StakeResponse>();
  const [dogeScore, setDogeScore] = useState<null | SideResponse>();
  const [shibaScore, setShibaScore] = useState<null | SideResponse>();
  const [remainingTimeSec, setRemainingTimeSec] = useState<null | BigNumber>();
  const [lastRoundWinners, setLastRoundWinners] = useState<null | LastRoundWinnersResponse>();
  const [pendingRewards, setPendingRewards] = useState<null | PendingRewardsResponse>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  async function getChosenSide(address: string): Promise<StakeResponse | undefined> {
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

  async function getPendingRewards(address: string): Promise<PendingRewardsResponse | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { pending_rewards: { address } }
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
        const lastRoundWinners: LastRoundWinnersResponse | undefined = await getLastRoundWinners()
        setLastRoundWinners(lastRoundWinners)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  useInterval(
    async () => {
      try {
        if (!connectedWallet?.terraAddress) return
        const pendingRewardsRes: PendingRewardsResponse | undefined = await getPendingRewards(connectedWallet?.terraAddress.toString())
        setPendingRewards(pendingRewardsRes)
      } catch (err) {
        console.error(err)
      }

    },
    3000,
  )

  // Timer

  useInterval(
    async () => {
      try {
        const lastRound: LastRoundResponse | undefined = await getLastRound()
        const blockInfo = await lcd?.tendermint.blockInfo()
        const currentBlockheight = blockInfo?.block?.header?.height
        if (lastRound?.last_round?.block_height && currentBlockheight) {
          const blocksBetweenRounds = parseInt(currentBlockheight) - lastRound?.last_round?.block_height
          const secondsBetweenRounds = blocksBetweenRounds * 5
          setRemainingTimeSec(secondsBetweenRounds ? new BigNumber(60).minus(secondsBetweenRounds) : null)
        }
      } catch (err) {
        console.error(err)
      }
    }, 30000
  )

  useInterval(
    async () => {
      try {
        if (!remainingTimeSec) {

          const lastRound: LastRoundResponse | undefined = await getLastRound()
          const blockInfo = await lcd?.tendermint.blockInfo()
          const currentBlockheight = blockInfo?.block?.header?.height
          if (lastRound?.last_round?.block_height && currentBlockheight) {
            const blocksBetweenRounds = parseInt(currentBlockheight) - lastRound?.last_round?.block_height
            const secondsBetweenRounds = blocksBetweenRounds * 5
            setRemainingTimeSec(secondsBetweenRounds ? new BigNumber(60).minus(secondsBetweenRounds) : null)
          }
        } else if (remainingTimeSec.lte(0)) {
          setRemainingTimeSec(new BigNumber(60))
        } else {
          setRemainingTimeSec(remainingTimeSec.minus(1))
        }
      } catch (err) {
        console.error(err)
      }
    }, 1000
  )

  BigNumber.set({ ROUNDING_MODE: 3 })
  let minutes = remainingTimeSec ? remainingTimeSec?.div(new BigNumber(60)) : null
  let seconds = minutes ? remainingTimeSec?.mod(new BigNumber(60)) : null
  minutes = minutes?.isNegative() ? new BigNumber(0) : minutes
  seconds = seconds?.isNegative() ? new BigNumber(0) : seconds
  const remainingTimeText = (minutes && seconds && !minutes.isNaN() && !seconds.isNaN()) ? `${minutes.toFixed(0)}m : ${seconds.toFixed(0)}s` : '-'

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

  const spacingStyle = { marginBottom: '.8vw' }

  const dogeTotalAmount = dogeScore?.side?.total_amount ? new BigNumber(dogeScore?.side?.total_amount) : new BigNumber(0)
  const shibaTotalAmount = shibaScore?.side?.total_amount ? new BigNumber(shibaScore?.side?.total_amount) : new BigNumber(0)

  const winningSide = dogeTotalAmount.lt(shibaTotalAmount) ? 1 : 2

  return (
    <div style={{ height: '100%', textAlign: 'left' }}>
      <div className='container' style={{ height: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div style={spacingStyle}><h2 className='text'>{`DOGE ${winningSide === 1 ? '(Currently Winning)' : ''}`}</h2></div>
          <div className='text' style={{ marginTop: '1rem', ...spacingStyle }}>Total Stakes: {dogeTotalAmountStr}</div>
          <div className='text' style={spacingStyle}>Win counts: {dogeWinningCountStr}</div>
          {side !== 1 && <div style={spacingStyle}>{<ChooseSideButton label={'Choose Doge'} side={2} />}</div>}
          {side !== 1 && <div className='text' style={spacingStyle}>* Side with lesser stakes wins</div>}
          {side === 1 && <div className='text' style={spacingStyle}>{`Your stakes: ${stakedAmountStr}`}</div>}
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div className='text' style={spacingStyle}>Your choice: {chosenSideStr}</div>
          <div className='text' style={spacingStyle}>{`Time left: ${remainingTimeText}`}</div>
          <div className='text' style={spacingStyle}>Previous winners: </div>
          <div style={{ display: 'flex', ...spacingStyle }}>
            {
              lastRoundWinners?.round_winners.map((winner, index) => {
                if (winner === 1) return <div key={`winner-${index}`} style={{ background: `url(${DogeLogo}) no-repeat`, backgroundSize: 'cover', width: '.7vw', height: '.7vw', marginRight: '.5vw' }} />
                if (winner === 2) return <div key={`winner-${index}`} style={{ background: `url(${ShibLogo}) no-repeat`, backgroundSize: 'cover', width: '.7vw', height: '.7vw', marginRight: '.5vw' }} />
                return <div />
              })
            }
          </div>
          <div className='text' style={spacingStyle}><SendDeposit chosenSide={side ?? 0} /></div>
          <div className='text' style={spacingStyle}><Withdraw /></div>
          <div style={spacingStyle}><Claim chosenSide={side ?? 0} unclaimedMessage={`Unclaimed: ${pendingRewards?.pending_rewards || 0} dogeshib`} /></div>
        </div>
        <div className='container' style={{ height: '100%', width: '33%', border: '3px brown solid', flexDirection: 'column' }}>
          <div style={spacingStyle}><h2 className='text'>{`SHIBA ${winningSide === 2 ? '(Currently Winning)' : ''}`}</h2></div>
          <div className='text' style={{ marginTop: '1rem', ...spacingStyle }}>Total Stakes: {shibaTotalAmountStr}</div>
          <div className='text' style={spacingStyle}>Win counts: {shibaWinningCountStr}</div>
          {side !== 2 && <div style={spacingStyle}>{<ChooseSideButton label={'Choose Shiba'} side={2} />}</div>}
          {side !== 2 && <div className='text' style={spacingStyle}>* Side with lesser stakes wins</div>}
          <div style={spacingStyle}>{side === 2 && <div className='text'>{`Your stakes: ${stakedAmountStr}`}</div>}</div>
        </div>
      </div >
    </div >
  );
}
