# react-app-constants

Build variants for React apps


[![CI](https://github.com/izumin5210/react-app-constants/workflows/CI/badge.svg)](https://github.com/izumin5210/react-app-constants/actions?query=branch%3Amaster+workflow%3ACI)
[![codecov](https://codecov.io/gh/izumin5210/react-app-constants/branch/master/graph/badge.svg)](https://codecov.io/gh/izumin5210/react-app-constants)
![GitHub](https://img.shields.io/github/license/izumin5210/react-app-constants)


| Name | Description | Version |
| ------- | ----------- |:-------:|
| [**react-app-constants**](./packages/react-app-constants) | Get constants with a hook | [![npm](https://img.shields.io/npm/v/react-app-constants)](https://www.npmjs.com/package/react-app-constants) |
| [**webpack-html-app-constants**](./packages/webpack-html-app-constants) | Inject application constants to HTML | [![npm](https://img.shields.io/npm/v/webpack-html-app-constants)](https://www.npmjs.com/package/webpack-html-app-constants) |
| [**webpack-html-powerstrip**](./packages/webpack-html-powerstrip) | Create different version `index.html`s | [![npm](https://img.shields.io/npm/v/webpack-html-powerstrip)](https://www.npmjs.com/package/webpack-html-powerstrip) |
 

## Get started
### Requirements
- [**react-app-rewired**](https://github.com/timarney/react-app-rewired) if you create the app with create-react-app

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
  const variants = ["production", "qa"];
  return rewireWithAppConstants(config, env, { variants });
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
import { setupContext } from "react-app-constants";

export interface Constants {
  BFF_URL: string
}

const { ConstantsProvider, useConstants } = setupContext<Constants>();

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
