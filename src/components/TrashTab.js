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

export default class TrashTab extends Component{

	constructor(props){
		super(props);
		this.renderContent = this.renderContent.bind(this);
		this.renderContentView = this.renderContentView.bind(this);
	}

	renderContent(){
		console.log(this.props);
		let trashArray = this.props.trashArray;
		if (trashArray != null){
			return(
				<div>
					{
						trashArray.map((element, id) => (
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
							message={this.props.trashArray[this.props.contentViewId]} 
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
    					<p>Trash</p>
    				</div>
						<div className="messages">
							{this.renderContent()}
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