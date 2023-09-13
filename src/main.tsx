// @ts-nocheck

import { render } from "preact";
import { App } from "./app.tsx";
import "./index.css";
import DBContextProvider from "./db-context.tsx";
import AppContextProvider from "./app-context.tsx";
import Router from "preact-router";
import { Deck } from "./deck.tsx";

const Comp = () => (
  <DBContextProvider>
    <AppContextProvider>
      <Router>
        <App path="/" />
        <Deck path="/deck" />
      </Router>
    </AppContextProvider>
  </DBContextProvider>
);

render(<Comp />, document.getElementById("app") as HTMLElement);
