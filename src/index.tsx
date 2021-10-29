import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Battle } from 'components/Battle';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { SignSample } from 'components/SignSample';
import ReactDOM from 'react-dom';
import './style.css';

function App() {
  return (
    <main className='main-container'>
      <div className='battle-container'>
        <div className='connect-container'>
          <ConnectSample />
        </div>
        <div style={{ height: '60%', width: '100%' }}>
          <Battle />
        </div>
        <div style={{ height: '30%', width: '100%', marginTop: '1rem' }}>
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
