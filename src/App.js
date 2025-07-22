import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";

import "/node_modules/primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { LayoutProvider } from "./store/layoutContext";
import store from "./store";
import Router from "./router/Router";

function App() {
  return (
    <Provider store={store}>
      <LayoutProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </LayoutProvider>
    </Provider>
  );
}

export default App;
