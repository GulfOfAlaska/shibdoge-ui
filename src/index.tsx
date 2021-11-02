import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { contractAddress } from 'constants/contractAddress';
import ReactDOM from 'react-dom';
import './style.css';
import OverTheHills from 'assets/OverTheHills.mp4'
import { useEffect } from 'react';

function App() {
  
  useEffect(() => {
    const audio = new Audio(OverTheHills)
    audio.volume = 0.6;
    audio.play()
  }, []);

  return (
    <main className='main-container'>
      <div className='battle-container'>
        <div className='header'>
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
