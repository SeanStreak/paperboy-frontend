import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import '../Main.css';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

//icons needed...
import { IoMdPaperPlane } from "react-icons/io";

//gql for queries/mutations
import { gql } from 'apollo-boost';

//SEND_MESSAGE_MUATION
const SEND_MESSAGE_MUTATION = gql`
	mutation sendMessageMutation($id: ID!, $draftSubject: String!, $draftBody: String!, $draftRecipient: String!){
		sendMessage(id: $id, subject: $draftSubject, description: $draftBody, recipientLink: $draftRecipient){
				id
				subject
				user{
					id
					name
				}
				description
				inbox{
					user{
						id
						name
						inlink
					}
				}
		}	
	}
`

//SEND_TASK_MUTATION
const SEND_TASK_MUTATION = gql`
	mutation sendTaskMutation($id: ID!, $draftSubject: String!, $draftBody: String!, $draftRecipient: String!){
		sendTask(id: $id, subject: $draftSubject, description: $draftBody, recipientLink: $draftRecipient){
				id
				subject
				user{
					id
					name
				}
				description
				inbox{
					user{
						id
						name
						inlink
					}
				}
		}	
	}
`

//DraftViewComponent
export default class DraftViewComponent extends Component{
	
	//constructor
	constructor(props){
		super(props);
		this.state={
			draftOption: "message",
			draftSubject: "",
			draftRecipient: "",
			draftBody: "",
		}
		//sendContent to users
		this.sendContent = this.sendContent.bind(this);
	}

	//sendContent (task or message) to another user
	sendContent(){
		//this.state
		let id = window.sessionStorage.getItem("userId");
		const { draftSubject, draftRecipient, draftBody, draftOption } = this.state;
		const client = this.props.client;
		
		if ( draftSubject == "" ){
			window.alert("You must have a subject");
			return;
		}
		if ( draftRecipient == "" ){
			window.alert("You must have a recipient");
			return;
		}
		if ( draftBody == ""){
			window.alert("You must enter a message body");
			return;	
		}	
		
		if ( draftOption == "message"){
			client.mutate({
				variables: { id, draftSubject, draftRecipient, draftBody },
				mutation: SEND_MESSAGE_MUTATION,
			})
			.then((response) => {
				window.location.reload();
			})
			.catch((error) => {
				if (error.message = "GraphQL error: No user exists with that link"){
					window.alert("Sorry, no recipient with that link exists, please try again.");
				}
				else{
					window.alert("Oops! We had an issue sending that message. Please try again!");
					window.location.reload();
				}
			})
		}
		else{
			client.mutate({
				variables: { id, draftSubject, draftRecipient, draftBody },
				mutation: SEND_TASK_MUTATION,
			})
			.then((response) => {
				window.location.reload();
			})
			.catch((error) => {
				if (error.message = "GraphQL error: No user exists with that link"){
					window.alert("Sorry, no recipient with that link exists, please try again.");
				}
				else{
					window.alert("Oops! We had an issue sending that message. Please try again!");
					window.location.reload();
				}
			})
		}
		return;
	}
	
	//render the DraftViewComponent
	render(){
		return(
			<div className="draft-subview">
				<Form className="form">
					<Form.Group className="form-group-type">
						<Form.Row>
							<Col xs={12}>
								<Dropdown as={ButtonGroup}>
								<Button variant="primary">Send as {this.state.draftOption}</Button>
								<Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
									<Dropdown.Menu>
										<Dropdown.Item onClick={() => this.setState({ draftOption: "message"})}>Send as message</Dropdown.Item>
									 	<Dropdown.Item onClick={() => this.setState({ draftOption: "task"})}>Send as task</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</Col>
						</Form.Row>
					</Form.Group>
					<Form.Group className="form-group-subject">
						<Form.Row>
							<Col xs={10}>
								<Form.Control type="subject" placeholder="Enter your subject..." className="input-subject" onChange={(event) => this.setState({ draftSubject: event.target.value })}/>
							</Col>
							<Col xs={2} className="submit" onClick={() => this.sendContent()}>
								<Button><IoMdPaperPlane/></Button>
							</Col>
						</Form.Row>
					</Form.Group>
					<Form.Group className="form-group-recipient">
						<Form.Control type="recipient" placeholder=" Enter a connection, username, or email..." className="input-recipient" onChange={(event) => this.setState({ draftRecipient: event.target.value })}/>
					</Form.Group>
					<Form.Group className="form-group-content">
						<Form.Control as="textarea" type="message" placeholder=" Type your message here and send!" className="input-message" onChange={(event) => this.setState({ draftBody: event.target.value })}/>
					</Form.Group>
				</Form>
			</div>
		)
	}
}