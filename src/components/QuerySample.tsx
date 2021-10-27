import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';

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
      setChosenSide(side?.side.toString())
    },
    3000,
  )

  return (
    <div>
      <h1>WHICH SIDE ARE YOU ON</h1>
      {chosenSide ? chosenSide : 'none'}
      {!connectedWallet && <p>Wallet not connected!</p>}
    </div>
  );
}
