import { getChainOptions, useConnectedWallet, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { contractAddress } from 'constants/contractAddress';
import ReactDOM from 'react-dom';
import './style.css';
import './components/componentStyle.css';
import BattleTheme from './assets/battletheme.mp3'
import { useEffect, useMemo, useRef, useState } from 'react';
import ShibaDoge from './assets/shiba-doge.png'
import { LCDClient } from '@terra-money/terra.js';
import BigNumber from 'bignumber.js';
import useInterval from 'hooks/useInterval';

function App() {
  const connectedWallet = useConnectedWallet();
  // const [playing, setPlaying] = useState(true);
  // const player = new Audio(BattleTheme)
  const [price, setPrice] = useState('');
  const myRef: any = useRef();
  const [audioStatus, changeAudioStatus] = useState(true);

  const startAudio = () => {
    myRef?.current?.play();

    changeAudioStatus(true);
  };

  const pauseAudio = () => {
    console.log("here");
    myRef?.current?.pause();
    changeAudioStatus(false);
  };

  // useEffect(() => {
  //   // if (!(location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  //     player.volume = 0.5;
  //     // player.loop = true
  //     playing ? player.play() : player.pause();
  //     return () => player.pause()
  //   // }
  // }, []);

  // function togglePlay() {
  //   // Using the callback version of `setState` so you always
  //   // toggle based on the latest state
  //   if (playing) {
  //     player.pause()
  //   } else {
  //     player.volume = 0.5;
  //     // player.loop = true
  //     player.play()
  //   }
  //   setPlaying(!playing);
  // }

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
      const PAIR_CONTRACT_ADDRESS = 'terra1ntdceldg23ymqljh94wcp78dl6qmzndq8u2hwa'
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
      <div className='battle-container'>
        <div className='header'>
          <div style={{ display: 'flex', height: '100%', width: '50%', alignItems: 'center' }}>
            <div style={{ background: `url(${ShibaDoge}) no-repeat`, backgroundSize: '100% 100%', height: '2.5vw', width: '2.5vw', marginRight: '1vw' }} />
            {/* {
              price && price != 'NaN' && <span style={{ fontSize: '.8vw', color: 'white', marginRight: '1vw' }}>{`$${price}`}</span>
            } */}
            <audio
              ref={myRef}
              src={BattleTheme}
            />
            {audioStatus ? (
              <button className='button' onClick={pauseAudio}>music</button>
            ) : (
              <button className='button' onClick={startAudio}>music</button>
            )}
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
