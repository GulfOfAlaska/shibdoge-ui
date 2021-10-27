import { LCDClient, TreasuryAPI } from '@terra-money/terra.js';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';

export function QuerySample() {
  const connectedWallet = useConnectedWallet();

  const [bank, setBank] = useState<null | string>();
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

  async function getChosenSide(address: string | undefined) {
    if (undefined) return null

    return lcd?.wasm.contractQuery(
      'terra10wlt3m7nqfgn9n5ddgwlqltgef957xytvnhn6m',
      { side: { address } }
    )
  }

  useInterval(
    async () => {
      // Your custom logic here
      const side: any = await getChosenSide(connectedWallet?.terraAddress.toString())
      setChosenSide(side)
    },
    3000,
  )

  useEffect(() => {
    if (connectedWallet && lcd) {
      lcd.bank.balance(connectedWallet.walletAddress).then((coins) => {
        setBank(coins.toString());
      });
    } else {
      setBank(null);
    }
  }, [connectedWallet, lcd]);

  return (
    <div>
      <h1>WHICH SIDE ARE YOU ON</h1>
      {bank && <pre>{bank}</pre>}
      {chosenSide ? chosenSide : 'none'}
      {!connectedWallet && <p>Wallet not connected!</p>}
    </div>
  );
}
