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
        <Battle />
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
