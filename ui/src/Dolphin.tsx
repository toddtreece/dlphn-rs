import * as React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch, Redirect } from 'react-router';
import { Store } from 'redux';
import { History } from 'history';
import { Container } from 'semantic-ui-react';

import { ApplicationState } from './store';
import { StreamsPage } from './pages/Streams';
import { DataPage } from './pages/Data';

interface MainProps {
  store: Store<ApplicationState>;
  history: History;
}

const Dolphin: React.FC<MainProps> = ({ store, history }) => {
  return (
    <Provider store={store}>
      <Container fluid style={{ padding: '20px' }}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/">
              <Redirect to="/streams" />
            </Route>
            <Route exact path="/streams" component={StreamsPage} />
            <Route path="/streams/:key/data" component={DataPage} />
            <Route component={() => <div>Not Found</div>} />
          </Switch>
        </ConnectedRouter>
      </Container>
    </Provider>
  );
};

export default Dolphin;
