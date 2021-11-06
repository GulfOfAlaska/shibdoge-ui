import { getChainOptions, useConnectedWallet, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { contractAddress } from 'constants/contractAddress';
import ReactDOM from 'react-dom';
import './style.css';
import './components/componentStyle.css';
import BattleTheme from './assets/battletheme.mp3'
import { useEffect, useMemo, useState } from 'react';
import ShibaDoge from './assets/shiba-doge.png'
import { LCDClient } from '@terra-money/terra.js';
import BigNumber from 'bignumber.js';
import useInterval from 'hooks/useInterval';

function App() {
  const connectedWallet = useConnectedWallet();
  const [playing, setPlaying] = useState(true);
  const [price, setPrice] = useState('');
  const player = new Audio(BattleTheme)

  useEffect(() => {
    if (!(location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      player.volume = 0.5;
      player.loop = true
      playing ? player.play() : player.pause();
      return () => player.pause()
    }
  }, []);

  function togglePlay() {
    // Using the callback version of `setState` so you always
    // toggle based on the latest state
    if (playing) {
      player.pause()
    } else {
      player.volume = 0.5;
      player.loop = true
      player.play()
    }
    setPlaying(!playing);
  }

  const lcd = useMemo(() => {
    if (!connectedWallet) {
      return null;
    }

    return new LCDClient({
      URL: connectedWallet.network.lcd,
      chainID: connectedWallet.network.chainID,
    });
  }, [connectedWallet]);

  useInterval(
    async () => {
      const PAIR_CONTRACT_ADDRESS = 'terra1sxxn4rxuqgxn3um6ly5lf9wsjuewrr7j8tvjg0'
      const poolInfo: any = await lcd?.wasm.contractQuery(
        PAIR_CONTRACT_ADDRESS,
        { pool: {} }
      )
      const ustReserve = new BigNumber(poolInfo.assets[0].amount)
      const coinReserve = new BigNumber(poolInfo.assets[1].amount)

      setPrice(ustReserve.div(coinReserve).toFixed(2))
    }, 3000);

  return (
    <main className='main-container'>
      {
        (!(location.hostname === "localhost" || location.hostname === "127.0.0.1"))
          ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ background: `url(${ShibaDoge}) no-repeat`, backgroundSize: '100% 100%', height: '20vw', width: '20vw', marginRight: '1vw' }} />
              <div className='text' style={{ color: 'white', fontSize: '2vw', textAlign: 'center', marginTop: '5vw' }}>First PVP MEME Coin on Terra</div>
              <div className='text' style={{ color: 'white', fontSize: '5vw', textAlign: 'center', marginTop: '5vw' }}>COMING SOON</div>
              <div className='text' style={{ color: 'white', fontSize: '1vw', textAlign: 'center', marginTop: '5vw' }}>Contract Address: terra14mvkydkwm2pzz62cgrkpeusphm4trrqrzd88ju (DOSH)</div>
              <div className='text' style={{ cursor: 'pointer', color: 'white', fontSize: '1vw', textAlign: 'center', marginTop: '3vw' }} onClick={(e) => {
                e.preventDefault();
                window.location.href = 'https://t.me/TerraDogeShib';
              }}>
                Telegram: https://t.me/TerraDogeShib
              </div>
            </div>
          )
          : (
            <div className='battle-container'>
              <div className='header'>
                <div style={{ display: 'flex', height: '100%', width: '50%', alignItems: 'center' }}>
                  <div style={{ background: `url(${ShibaDoge}) no-repeat`, backgroundSize: '100% 100%', height: '2.5vw', width: '2.5vw', marginRight: '1vw' }} />
                  {
                    price && <span style={{ fontSize: '.8vw', color: 'white', marginRight: '1vw' }}>{`$${price}`}</span>
                  }
                  <button className='button' onClick={() => togglePlay()}>Music</button>
                </div>
                <ConnectSample />
              </div>
              <div style={{ height: '50%', width: '100%' }}>
                <Battle />
              </div>
              <div style={{ height: '40%', width: '100%', marginTop: '1rem' }}>
                <QuerySample />
              </div>
              <div style={{ color: 'white', fontSize: '.8vw', textAlign: 'right', marginTop: '1vw' }}>{`contract address: ${contractAddress}`}</div>
            </div>
          )

      }
    </main>
  );
}

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <App />
    </WalletProvider>,
    document.getElementById('root'),
  );
});
