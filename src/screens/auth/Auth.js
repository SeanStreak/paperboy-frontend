import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import logo from '../../logo.svg';
import '../../App.css';
import '../../Auth.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import { gql } from 'apollo-boost';

const SIGNIN_USER = gql`
	mutation signInUserQuery($loginLink: String!, $loginPassword: String!){
		signinUser(inlink: $loginLink, password: $loginPassword){
			token
			user {
				id
				inlink
				name
			}
		}	
	}
`
export default class Auth extends Component{

	//constructor
	constructor(props){
		super(props);
		this.state={
			currentStateView: "login",
			loginLink: "",
			loginPassword: "",
		}
		
		this.renderSubView = this.renderSubView.bind(this);
		this.loginUser = this.loginUser.bind(this);
	}

	loginUser(){
		const { loginLink, loginPassword } = this.state;
		const client = this.props.client;

		if (loginLink == ""){
			window.alert("Please enter a login link")
			return;
		}
		else if (loginPassword == ""){
			window.alert("Please enter a password")
			return;
		}
		else{
			client.mutate({
				mutation: SIGNIN_USER,
				variables: { loginLink, loginPassword}
			})
				.then((response) => {
					const responseData = response.data.signinUser;
					this.props.updateFunc(responseData.token, responseData.user);
				})
				.catch((error) => {
					console.log(error);
					window.alert("Invalid credentials. Please try again!");
				})
		}
	}


	renderSubView(){
		let { currentStateView } = this.state;
		
		if ( currentStateView == "login" ) {
			return (
				<div style={{display: 'flex',  justifyContent:'center', height: '100vh'}}>
        			<div className="loginForm">
        				<Form className="formAuth">
        					<Form.Group controlId="formEntryLink" onChange={(event) => this.setState({ loginLink: event.target.value })}>
        						<Form.Label className="label">Link</Form.Label>
        						<Form.Control type="name" placeholder="Enter your link" className="input"/>
        					</Form.Group>
        					<Form.Group controlId="formEntryPassword" onChange={(event) => this.setState({ loginPassword: event.target.value })}>
        						<Form.Label className="label">Password</Form.Label>
        						<Form.Control type="password" placeholder="Enter your password" className="input"/>
        					</Form.Group>
        					<Button variant="primary" onClick={this.loginUser} className="button-login">
        			    		Login
        					</Button>	
        				</Form>
					</div>
				</div>	
			)
		}
		if ( currentStateView == "signup" ) {
			return(
				<div>
					<p>Join PaperBoy</p> 
        	<p>We're excited to see you join!</p>
        	<Button variant="outline-primary">Signup</Button>{' '}
        	<Button variant="outline-primary">Have an account? Login here</Button>{' '}
				</div>	
			)			
		}		
	}

	render(){
		return(
      <div className="screen-auth">
        {this.renderSubView()}
      </div>
    )
	}
}