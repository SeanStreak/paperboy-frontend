import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

import Auth from "./screens/auth/Auth.js";
import Main from "./screens/app/Main.js";

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      stateToken: null,
      user: {
        name: "Sean Maina"
      },  
    }

    this.returnStateView = this.returnStateView.bind(this);
    this.updateCredentials = this.updateCredentials.bind(this);
    
  }

  updateCredentials(token, userData){
    window.sessionStorage.setItem("stateToken", token);
    window.sessionStorage.setItem("userId", userData.id);
    window.location.reload();
  }
  
  returnStateView(){
    console.log("hit");
    // stateToken, user
    let stateTokenData = window.sessionStorage.getItem("stateToken");
    // stateToken
    if ( stateTokenData == null ){
      return (
        <BrowserRouter>
          <Switch>
            <Route path="/" exact render={(props) => <Auth {...props} client={this.props.client} updateFunc={this.updateCredentials} />} />
          </Switch>
        </BrowserRouter>  
      );   
    }
    else{
      console.log("so this...")
      return (
        <BrowserRouter>
          <Switch>
            <Route path="/" exact render={(props) => <Main {...props} client={this.props.client} />} />
          </Switch>
        </BrowserRouter>  
      );  
    }
  }

  render(){
    return(
      <div>
        {this.returnStateView()}
      </div>
    )
  }
}
