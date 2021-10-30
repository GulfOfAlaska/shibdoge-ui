import { LCDClient } from '@terra-money/terra.js';
import { ConnectType, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import React, { useEffect, useMemo, useState } from 'react';
import './componentStyle.css'

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
  const [bank, setBank] = useState<null | string>();

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

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
      <footer style={{display: 'flex', alignItems: 'center'}}>
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
        <div style={{marginRight: '0.5rem', color: 'white'}}>
          {status === WalletStatus.WALLET_CONNECTED && (
            <div>{wallets[0]['terraAddress']}</div>
          )}
          {bank && <div>{bank}</div>}
        </div>
        {status === WalletStatus.WALLET_CONNECTED && (
          <div className='button' onClick={() => disconnect()}>Disconnect</div>
        )}
      </footer>
    </div>
  );
}
