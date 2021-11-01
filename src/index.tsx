import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import ReactDOM from 'react-dom';
import './style.css';

function App() {
  return (
    <main className='main-container'>
      <div className='battle-container'>
        <div className='header'>
          <div className='connect-container'>
            <ConnectSample />
          </div>
        </div>
        <div style={{ height: '50%', width: '100%' }}>
          <Battle />
        </div>
        <div style={{ height: '40%', width: '100%', marginTop: '1rem' }}>
          <QuerySample />
        </div>
        {/* <SignSample /> */}
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
