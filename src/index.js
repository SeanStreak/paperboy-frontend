import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import * as serviceWorker from './serviceWorker';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-client';
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from 'apollo-cache-inmemory'

const link = createHttpLink({
	uri: "http://paperboy-backend.herokuapp.com/graphql",
	credentials: 'same-origin',
	headers: {
		'Content-Type': "application/json"
	},
})

const client = new ApolloClient({
	link: link,
	cache: new InMemoryCache(),
})

const AppComponent = () => (
  <ApolloProvider client={client}>
    <App client={client}/>
  </ApolloProvider>
);

ReactDOM.render(<AppComponent />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
