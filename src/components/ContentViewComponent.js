import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import '../Main.css';
import '../Message.css';

// react-bootstrap components
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

// important icons needed
import { gql } from 'apollo-boost';
import { IoMdCheckmark, IoMdTrash } from "react-icons/io";

const UPDATE_ITEM_STATUS_MUTATION = gql`
	mutation updateInboxItemStatusMutation($id: ID!, $status: String!, $itemType: String!){
		updateInboxItemStatus(id: $id, status: $status, itemType: $itemType)
	}
`

//ContentViewComponent
export default class ContentViewComponent extends Component{
	constructor(props){
		super(props);

		this.updateItemStatus = this.updateItemStatus.bind(this);
	}

	updateItemStatus(id, status, itemType){
		const client = this.props.client;
		console.log(id);
		client.mutate({
			variables: { id, status, itemType },
			mutation: UPDATE_ITEM_STATUS_MUTATION,
		})
		.then((response) => {
			window.location.reload();
		})
		.catch((error) => {
			window.alert("Oops! We had an error, please try again.");
			console.log(error);
		})
	}

	render(){
		console.log(this.props.message);
		if (this.props.message != undefined){
			return(
				<div className="content-subview">
					<div className="message-content-view">
						<div className="message-header">
							<Form.Row>
								<Col xs={8}>
									<p className="message-sender-name">{this.props.message.user.name} ({this.props.message.__typename}) </p>
								</Col>
								<Col xs={4}>
									<p className="message-sender-timestamp">Sent on {this.props.message.timeStamp}</p>
								</Col>
							</Form.Row>
						</div>
						<div className="message-content">
							<p className="message-subject">{this.props.message.subject}</p>
							<div className="message-body">
								{this.props.message.description}
							</div>
							<div className="message-actions">
								<Button className="button-message-action" onClick={() => this.updateItemStatus(this.props.message.id, "read", this.props.message.__typename)}>
									<IoMdCheckmark className="icon"/>
								</Button>
								<Button className="button-message-action" onClick={() => this.updateItemStatus(this.props.message.id, "trash", this.props.message.__typename)}>
						  		<IoMdTrash className="icon"/> 		
								</Button>
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}