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
      <ConnectSample />
      <div className='battle-container'>
        <QuerySample />
        <div style={{ height: '100%', width: '70%', padding: '5rem 0', marginLeft: '1rem',}}>
          <Battle />
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
