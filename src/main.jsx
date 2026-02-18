import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Provider } from "react-redux";
import store from "./store/store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
