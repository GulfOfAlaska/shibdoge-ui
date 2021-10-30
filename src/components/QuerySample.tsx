import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import useInterval from 'hooks/useInterval';
import { useMemo, useState } from 'react';
import './componentStyle.css'
import { SendDeposit } from './SendDeposit';

interface SideResponse {
  side: number
}

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [chosenSide, setChosenSide] = useState<null | string>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  async function getChosenSide(address: string): Promise<SideResponse | undefined> {
    return lcd?.wasm.contractQuery(
      'terra10wlt3m7nqfgn9n5ddgwlqltgef957xytvnhn6m',
      { side: { address } }
    )
  }

  useInterval(
    async () => {
      if (!connectedWallet?.terraAddress) return
      const side: SideResponse | undefined = (await getChosenSide(connectedWallet?.terraAddress.toString()))
      if (!side?.side) {
        return
      }
      if (side.side === 1) {
        setChosenSide('doge')
      }
      if (side?.side === 2) {
        setChosenSide('shiba')
      }
    },
    3000,
  )

  return (
    <div style={{ height: '100%' }}>
      <div className='container' style={{ height: '100%' }}>
        {chosenSide ? chosenSide : 'none'}
        {!connectedWallet && <p>Wallet not connected!</p>}
        <SendDeposit />
      </div>
    </div>
  );
}
