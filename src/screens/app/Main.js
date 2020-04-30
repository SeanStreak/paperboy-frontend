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

//PusherJS
import Pusher from 'pusher-js';

//Components needed
import InboxTab from "../../components/InboxTab.js";
import ReadTab from "../../components/ReadTab.js";
import TrashTab from "../../components/TrashTab.js";


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
		this.renderTabView = this.renderTabView.bind(this);
		this.setContentView = this.setContentView.bind(this);
		this.showContent = this.showContent.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
	}

	// a bit janky, sets us up with the user data using sessionStorage
	// and sorting data into inbox/sent/trash (based on the status)
	// we'll likely want to pivot into a better GQL query that can parse on the backend
	// so the frontend is as dumb as possible
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
		 	var readArray = [];
		 	var trashArray = [];
		 	for (var i = 0; i < response.data.getUser.inbox.getInboxContent.length; i++){
		 		let data = response.data.getUser.inbox.getInboxContent[i];
		 		if (data.status == "sent"){
		 			inboxArray.push(data);	
		 		}	
		 		else if (data.status == "read"){
		 			readArray.push(data);	
		 		}
		 		else if (data.status == "trash"){
		 			trashArray.push(data);
		 		}
		 	}

		 	this.setState({ inboxArray: inboxArray })
		 	this.setState({ readArray: readArray })
		 	this.setState({ trashArray: trashArray })
		 
		 })
		 .catch((error) => console.log(error));
		
		this.setState({ currentTab: "inbox"})
		this.setState({ currentContentView: "draft-view" })
	
	}

	//componentDidMount
	componentDidMount(){
		const channel = pusher.subscribe("paperboy-message-network");
		const userId = this.state.userId;
		channel.bind('new-message', function(data){
			if (data.receiver_id == userId){
				window.location.reload();
			}
		})

	}
	
	//change the tabView (inbox, read, sent)
	setTabView(tabOption){
		this.setState({ currentTab: tabOption})
		this.setState({ currentContentView: "draft-view"})
	}

	renderTabView(){
		let { currentContentId, currentContentView, currentTab, inboxArray, readArray, trashArray } = this.state;

		//inbox tabView
		if (currentTab == "inbox"){
			return <InboxTab 
								inboxArray={inboxArray}
								contentViewId={currentContentId}
								viewType={currentContentView}
								client={this.props.client}
								funcShowContent={this.showContent}/>;
		}
		if (currentTab == "read"){
			return <ReadTab
								readArray={readArray}
								contentViewId={currentContentId}
								viewType={currentContentView}
								client={this.props.client}
								funcShowContent={this.showContent}/>;
		}
		if (currentTab == "trash"){
			return <TrashTab
								trashArray={trashArray}
								contentViewId={currentContentId}
								viewType={currentContentView}
								client={this.props.client}
								funcShowContent={this.showContent}/>;
		}
	}
	//setContentView (drafts vs received content)
	setContentView(viewOption){
		this.setState({ currentContentView: viewOption})
	}

	//showContent
	showContent(id){
		this.setState({ currentContentId: id })
		this.setState({ currentContentView: "content-view"})
	}

	//updateDraftOption
	updateDraftOption(id){
		if (id == 1){
			this.setState({ currentDraftOption: 1})	
		}
		else{
			this.setState({ currentDraftOption: 2})
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
    				{/** Here we will render differnt tabView*/}
    				{this.renderTabView()}
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