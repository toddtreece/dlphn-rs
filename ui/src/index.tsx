import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';

import Dolphin from './Dolphin';
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configure';

import 'semantic-ui-css/semantic.min.css';

const history = createBrowserHistory();
const store = configureStore(history);

ReactDOM.render(<Dolphin store={store} history={history} />, document.getElementById('root'));

serviceWorker.unregister();
