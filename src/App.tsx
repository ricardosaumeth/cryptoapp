import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import createStore, { type AppDispatch } from './modules/redux/store';
import { subscribeToSymbol } from './core/transport/slice';
import Trades from './modules/trades/components';
import { Container, Header, TradesPanel } from './App.styled';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

const store = createStore();

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const symbol = 'tBTCUSD';

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(subscribeToSymbol({ symbol }));
    }, 2000);

    return () => clearTimeout(timer);
  }, [dispatch, symbol]);

  return (
    <Container>
      <Header>
        <h1>Crypto Trader</h1>
      </Header>
      <TradesPanel>
        <Trades symbol={symbol} />
      </TradesPanel>
    </Container>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
