import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";

import "/node_modules/primeflex/primeflex.css";
import "primeicons/primeicons.css";
import { LayoutProvider } from "./store/layoutContext";
import store from "./store";
import Router from "./router/Router";
import { LoadingProvider } from "./context/LoadingContext";
import FullPageLoader from "./components/FullPageLoader";

function App() {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <LayoutProvider>
          <BrowserRouter>
            <FullPageLoader />
            <Router />
          </BrowserRouter>
        </LayoutProvider>
      </LoadingProvider>
    </Provider>
  );
}

export default App;
