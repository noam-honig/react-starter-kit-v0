import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { StackUtilsComponent } from './Utils/StackUtils';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import './Utils/AugmentRemult';
import { AuthService } from "./Users/AuthService";
import { Remult } from "remult";
import { AuthContext, RemultContext } from './common';




axios.interceptors.request.use(config => {
  const token = AuthService.fromStorage();
  if (token)
    config.headers!["Authorization"] = "Bearer " + token;
  return config;
});
Remult.apiBaseUrl = '/api';
export const remult = new Remult(axios);
export const auth = new AuthService(remult);


// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});
const theme = createTheme({
  direction: 'rtl', // Both here and <body dir="rtl">
});



ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheRtl}>
        <BrowserRouter>
          <RemultContext.Provider value={remult}>
            <AuthContext.Provider value={auth}>
              <StackUtilsComponent >
                <App />
              </StackUtilsComponent>
            </AuthContext.Provider>
          </RemultContext.Provider>
        </BrowserRouter>
      </CacheProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
