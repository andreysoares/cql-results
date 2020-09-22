import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "../../containers/Home/Home";
import Launch from "../../components/Launch/Launch";

const App = () => {
  return (
    <BrowserRouter>
      <Route path="/app" component={Home} />
      <Route path="/launch" component={Launch} />
    </BrowserRouter>
  );
};

export default App;
