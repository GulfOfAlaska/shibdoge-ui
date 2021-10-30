import { Coin, Coins, LCDClient } from '@terra-money/terra.js';
import { ConnectType, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import BigNumber from 'bignumber.js';
import { contractAddress } from 'constants/contractAddress';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';
import './componentStyle.css'

export interface Balance {
  balance: string
}

export function ConnectSample() {
  const {
    status,
    network,
    wallets,
    availableConnectTypes,
    availableInstallTypes,
    connect,
    install,
    disconnect,
  } = useWallet();
  const connectedWallet = useConnectedWallet();
  const [bank, setBank] = useState<null | Coin[]>();
  const [balance, setBalance] = useState<null | any>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  async function queryBalance(): Promise<Balance | undefined> {
    return lcd?.wasm.contractQuery(
      contractAddress,
      { balance: { address: connectedWallet?.terraAddress.toString() } }
    )
  }

  useInterval(
    async () => {
      if (connectedWallet && lcd) {
        const bankRes = await lcd.bank.balance(connectedWallet.walletAddress)
        const coinList = bankRes.toArray()
        setBank(coinList);

        const balanceRes: Balance | undefined = await queryBalance()
        console.log(balanceRes)
        setBalance(balanceRes?.balance);
      } else {
        setBank(null);
      }
    }, 3000);


  return (
    <div>
      <footer style={{ display: 'flex', alignItems: 'center' }}>
        {status === WalletStatus.WALLET_NOT_CONNECTED && (
          <>
            {availableInstallTypes.map((connectType) => (
              <button
                className='button'
                key={'install-' + connectType}
                onClick={() => install(connectType)}
              >
                Install {connectType}
              </button>
            ))}
            <div className='button'
              onClick={() => connect(ConnectType.CHROME_EXTENSION)}
            >
              Connect
            </div>
          </>
        )}
        <div style={{ marginRight: '0.5rem', color: 'white' }}>
          {status === WalletStatus.WALLET_CONNECTED && (
            <div>{wallets[0]['terraAddress']}</div>
          )}
          {bank && (
            bank.map((coin: Coin) =>
              <span key={`balance-${coin.denom}`}>{`${coin.denom.slice(1)}: ${new BigNumber(coin.amount.toString()).shiftedBy(-6).toString()} `}</span>
            )
          )}
          {
            balance && <span>{`dogeshib: ${new BigNumber(balance).shiftedBy(-6).toString()}`}</span>
          }
        </div>
        {status === WalletStatus.WALLET_CONNECTED && (
          <div className='button' onClick={() => disconnect()}>Disconnect</div>
        )}
      </footer>
    </div>
  );
}
