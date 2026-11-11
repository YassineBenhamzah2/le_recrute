import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import './index.css';
import './tailwind.output.css';
import App from './App';
import './bootstrap.min.css';
import 'css-pro-layout/dist/css/css-pro-layout.min.css';
import 'react-pro-sidebar/dist/css/styles.css';
import { Provider } from 'react-redux';
import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
