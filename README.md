# react-app-constants

[![CI](https://github.com/izumin5210/react-app-constants/workflows/CI/badge.svg)](https://github.com/izumin5210/react-app-constants/actions?query=branch%3Amaster+workflow%3ACI)
[![codecov](https://codecov.io/gh/izumin5210/react-app-constants/branch/master/graph/badge.svg)](https://codecov.io/gh/izumin5210/react-app-constants)
![GitHub](https://img.shields.io/github/license/izumin5210/react-app-constants)


## Get started
### Configure webpack and constants

```console
$ yarn add --dev webpack-html-app-constants
$ yarn add react-app-constants
```

```js
// config-overrides.js
const {
  rewire: rewireWithAppConstants,
} = require("webpack-html-app-constants");

module.exports = function override(config, env) {
  const variations = ["production", "qa"];
  return rewireWithAppConstants(config, env, { variations });
};
```

```console
$ cat .env
REACT_APP_BFF_URL=https://bff-local.example.com/

$ cat .env.qa
REACT_APP_BFF_URL=https://bff-qa.example.com/

$ cat .env.production
REACT_APP_BFF_URL=https://bff-production.example.com/
```

```console
$ yarn build
$ ls build/*.html
build/index.production.html build/index.qa.html 
```

### Use constants in React application

```tsx
// ---- src/constants.ts ----
import { createConstantsContext } from "react-app-constants";

export interface Constants {
  BFF_URL: string
}

const { ConstantsProvider, useConstants } = createConstantsContext<Constants>();

export { ConstantsProvider, useConstants };


// ---- src/App.tsx ----
import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";

import { ConstantsProvider, useConstants } from "./constants";

const App: React.FC = () => {
  const { BFF_URL } = useConstants();
  const client = new ApolloClient({ uri: BFF_URL });

  return (
    <ApolloProvider client={client}>
      { /* ... */ }
    </ApolloProvider>
  );
};

const AppWrapper: React.FC = () => (
  <ConstantsProvider>
    <App />
  </ConstantsProvider>
);

export default AppWrapper;
```
