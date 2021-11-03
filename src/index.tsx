import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { contractAddress } from 'constants/contractAddress';
import ReactDOM from 'react-dom';
import './style.css';
import './components/componentStyle.css';
import OverTheHills from 'assets/OverTheHills.mp4'
import { useEffect, useState } from 'react';
import ShibaDoge from './assets/shiba-doge.png'

function App() {

  const [playing, setPlaying] = useState(true);
  const player = new Audio(OverTheHills)
  useEffect(() => {
    player.volume = 0.5;
    playing ? player.play() : player.pause();
    return () => player.pause()
  }, []);

  function togglePlay() {
    // Using the callback version of `setState` so you always
    // toggle based on the latest state
    if (playing) {
      player.pause()
    } else {
      player.volume = 0.5;
      player.play()
    }
    setPlaying(!playing);
  }

  return (
    <main className='main-container'>
      <div className='battle-container'>
        <div className='header'>
          <div style={{ display: 'flex', height: '100%', width: '50%', alignItems: 'center'}}>
            <div style={{ background: `url(${ShibaDoge}) no-repeat`, backgroundSize: '100% 100%', height: '4vw', width: '4vw', marginRight: '2vw' }} />
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
        {/* <SignSample /> */}
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
