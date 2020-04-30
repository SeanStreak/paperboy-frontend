import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import '../Main.css';
import '../Message.css';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import DraftViewComponent  from "./DraftViewComponent.js";
import ContentViewComponent  from "./ContentViewComponent.js";

export default class InboxTab extends Component{
	constructor(props){
		super(props);
		
		this.renderInbox = this.renderInbox.bind(this);
		this.renderContentView = this.renderContentView.bind(this);
	}

	//renderInbox
	renderInbox(){
		let inboxArray = this.props.inboxArray;
		if (inboxArray != null){
			return(
				<div>
					{
						inboxArray.map((element, id) => (
							<div key={id} onClick={() => this.props.funcShowContent(id)}>
								<div className="div-inbox-message"> 
										<div className="inbox-message-header">
											<Form.Row>
												<Col xs={6}>
													<p className="inbox-message-sender">{element.user.name} - {element.__typename}</p>
												</Col>
												<Col xs={6}>
													<p className="inbox-message-timestamp">{element.timeStamp}</p>
												</Col>
											</Form.Row>
										</div>
										<div className="inbox-message-subject">
											<p>{element.subject}</p>					
										</div>
										<div className="inbox-message-content">
											<p>{element.description}</p>					
										</div>
									</div>
							
							</div>
						))
					}
				</div>
			)
		}
	}
	
	//renderContentView
	renderContentView(){

		if (this.props.viewType == "draft-view"){
			return <DraftViewComponent 
							client={this.props.client}/>;	
		}
		else{
			
			return <ContentViewComponent 
							client={this.props.client} 
							message={this.props.inboxArray[this.props.contentViewId]} 
							client={this.props.client}/>;
		}
	}

	//render
	render(){
		return(
			<Container fluid>
    		<Row fluid>
    			<Col xs={4} className="list">
    				<div className="inbox-header">
    					<p>Inbox</p>
    				</div>
						<div className="messages">
							{this.renderInbox()}
						</div>
					</Col>
   				<Col xs={8} className="content">
    				{this.renderContentView()}	
    			</Col>
    		</Row>
    	</Container>
		)
	}
}