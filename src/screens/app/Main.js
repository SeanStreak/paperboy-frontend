import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import logo from '../../logo.svg';
import '../../Main.css';
import '../../Message.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import SplitButton from 'react-bootstrap/SplitButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { gql } from 'apollo-boost';
import { 
				 IoIosCheckmark,
				 IoIosCreate, 
				 IoIosAddCircle,
				 IoIosSend, 
				 IoMdReturnLeft,
				 IoIosGlobe, 
				 IoMdPaperPlane, 
				 IoMdCheckmark,
				 IoMdDoneAll,
				 IoIosCheckmarkCircle, 
				 IoIosTrash,
				 IoMdTrash, 
				 IoIosLogOut, } from "react-icons/io";
import Pusher from 'pusher-js';

const pusher = new Pusher('e2efd547e5c8e70a45b1', {
	cluster: 'us2',
})

const GET_USER_DATA_QUERY = gql`
	query getUserQuery($userId: Int!){
		getUser(id: $userId){
			id
			name
			inlink
			inbox{
				id
				getInboxContent{
					__typename
					... on Note{
						id
						subject
						description
						timeStamp
						status
						user{
							id
							name
							inlink
						}
						
					}
					... on Task{
						id
						subject
						description
						timeStamp
						status
						user{
							id
							name
							inlink
						}
					}
				}
			}
		}	
	}
`

//send message querys
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

const UPDATE_ITEM_STATUS_MUTATION = gql`
	mutation updateInboxItemStatusMutation($id: ID!, $status: String!, $itemType: String!){
		updateInboxItemStatus(id: $id, status: $status, itemType: $itemType)
	}
`

export default class Main extends Component{
	constructor(props){
		super(props);
		this.state = {
			currentTab: "",
			currentContentView: "",
			userId: null,
			userData: null,
			userDataInbox: [],
			currentContentId: null,
			draftSubject: "",
			draftRecipient: "",
			draftBody: "",
			draftOption: "message",
		}

		this.setTabView = this.setTabView.bind(this);
		this.setContentView = this.setContentView.bind(this);
		this.renderContentView = this.renderContentView.bind(this);
		this.showContent = this.showContent.bind(this);
		this.updateItemStatus = this.updateItemStatus.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
	}

	componentWillMount(){
		let userId = window.sessionStorage.getItem("userId");
		const client = this.props.client;
		userId = parseInt(userId);
		this.setState({ userId: userId })
		client.query({
			variables: { userId },
			query: GET_USER_DATA_QUERY,
			fetchPolicy: "no-cache",
		})
		 .then((response) => {
		 	this.setState({ userData: response.data.getUser })
		 	this.setState({ userDataInbox: response.data.getUser.inbox.getInboxContent})
		 	var inboxArray = [];
		 	for (var i = 0; i < response.data.getUser.inbox.getInboxContent.length; i++){
		 		if (response.data.getUser.inbox.getInboxContent[i].status == "sent"){
		 			inboxArray.push(response.data.getUser.inbox.getInboxContent[i])	
		 		}			
		 	}

		 	this.setState({ inboxArray: inboxArray })
		 })
		 .catch((error) => console.log(error));
		this.setState({ currentContentView: "draft-view" })
	
	}

	componentDidMount(){
		const channel = pusher.subscribe("paperboy-message-network");
		const userId = this.state.userId;
		channel.bind('new-message', function(data){
			if (data.receiver_id == userId){
				window.location.reload();
			}
		})

	}
	
	setTabView(tabOption){
		this.setState({ currentTab: tabOption})
	}

	setContentView(viewOption){
		this.setState({ currentContentView: viewOption})
	}

	showContent(id){
		this.setState({ currentContentId: id })
		this.setState({ currentContentView: "content-view"})
	}

	updateDraftOption(id){
		if (id == 1){
			this.setState({ currentDraftOption: 1})	
		}
		else{
			this.setState({ currentDraftOption: 2})
		}
	}

	renderDraftOption(id){
		return (id == this.state.currentDraftOption) ? true : false;
	}
	
	renderInbox(){
		const { userDataInbox, inboxArray } = this.state;
		console.log(inboxArray)
		if (inboxArray != null){
			return(
				<div>
					{
						inboxArray.map((element, id) => (
							<div key={id} onClick={() => this.showContent(id)}>
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
	
	sendContent = () => {
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

	renderContentView = () =>{
		let { currentContentView, userData, inboxArray } = this.state;
		if ( currentContentView == "draft-view"){
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
		else{
			if (inboxArray != null){
				const data = inboxArray[this.state.currentContentId];
				console.log(this.state.currentContentId);
				return(
					<div className="content-subview">
						<div className="message-content-view">
							<div className="message-header">
								<Form.Row>
									<Col xs={8}>
										<p className="message-sender-name">{data.user.name} ({data.__typename}) </p>
									</Col>
									<Col xs={4}>
										<p className="message-sender-timestamp">Sent on {data.timeStamp}</p>
									</Col>
								</Form.Row>
							</div>
							<div className="message-content">
								<p className="message-subject">{data.subject}</p>
								<div className="message-body">
									{data.description}
								</div>
							<div className="message-actions">
								<Button className="button-message-action" onClick={() => this.updateItemStatus(data.id, "read", data.__typename)}>
									<IoMdCheckmark className="icon"/>
								</Button>
								<Button className="button-message-action" onClick={() => this.updateItemStatus(data.id, "trash", data.__typename)}>
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

	logoutUser(){
		window.sessionStorage.clear();
		window.location.reload();		
	}
	
	render(){	
		return(
			<div className="viewMain">
				<Container fluid>
					<Row fluid>
						<Col xs={2} className="menu" fluid>
							<div className="menu-content">
								<Image src={require("../../logoPaperboy.png")} className="logo"/>
								<Button className="menu-button-top" onClick={() => this.setTabView("inbox")}>
									<p><IoIosCreate/> Inbox</p>
								</Button>
								<Button className="menu-button-middle" onClick={() => this.setTabView("read")}>
									<p> <IoIosCheckmarkCircle/> Read</p>
								</Button>
								<Button className="menu-button-middle" onClick={() => this.setTabView("sent")}>
									<p> <IoIosSend/> Sent</p>
								</Button>
								<Button className="menu-button-trash" onClick={() => this.setTabView("trash")}>
									<p> <IoIosTrash/> Trash</p>
								</Button>
								<Button className="button-create-draft" onClick={() => this.setState({ currentContentView: "draft-view"})}>
									<IoIosAddCircle/>
								</Button>
						</div>
					</Col>
    			<Col xs={9} className="main">
    				<Container fluid>
    					<Row fluid>
    						<Col xs={4} className="list">
    							<div className="inbox-header">
    								<p>Inbox</p>
    								<Button> Tasks </Button>
    								<Button className="inbox-button-filter-messages"> Messages </Button>
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
    			</Col>
    			<Col xs={1} className="sidebar">
    				<Button className="logout" onClick={() => this.logoutUser()}><IoIosLogOut/></Button><br/>
    			</Col>
				</Row>
			</Container>
			</div>
		)
	}
}