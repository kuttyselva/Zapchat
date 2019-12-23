import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'
export default class Messages extends Component {
  state = {
    isPrivateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messageRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressbar: false,
    numUniqueUser: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: []
  }
  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) {
      this.addListener(channel.id);
    }
  }
  addListener = (channelId) => {
    this.addMessageListener(channelId);
  }
  addMessageListener = channelId => {
    let LoadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on('child_added', snap => {
      LoadedMessages.push(snap.val());
      this.setState({
        messages: LoadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(LoadedMessages);
    })
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUser = `${uniqueUsers.length} user${plural ? 's' : ''}`;

    this.setState({ numUniqueUser });
  };
  displayMessages = messages => (
    messages.length > 0 && messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />

    ))
  );
  isProgressBarVisible = (percent) => {
    if (percent > 0) {
      this.setState({ progressbar: true });
    }
  };

  displayChannelName = channel => {
    return channel ? `${this.state.isPrivateChannel ? '@' : '#'} ${channel.name}` : '';
  }

  getMessagesRef = () => {
    const { messageRef, privateMessagesRef, isPrivateChannel } = this.state;
    return isPrivateChannel ? privateMessagesRef : messageRef;
  }

  handleSearchChange = event => {
    this.setState({ searchTerm: [event.target.value], searchLoading: true },
      () => {
        this.handleSearchMessages()
      });
  }

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {

      if (message.content && (message.content.match(regex) || message.user.name.match(regex))) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 700);
  }

  render() {
    const { messageRef, messages, channel, user, progressbar, numUniqueUser, searchTerm, searchResults, searchLoading, isPrivateChannel } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader isPrivateChannel={isPrivateChannel} searchLoading={searchLoading} handleSearchChange={this.handleSearchChange} channelName={this.displayChannelName(channel)} users={numUniqueUser} />
        <Segment>
          <Comment.Group className={progressbar ? 'messages__progress' : ' messages'}>
            {/* messages */}

            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} isPrivateChannel={isPrivateChannel} messageRef={messageRef} currentUser={user} currentChannel={channel} isProgressBarVisible={this.isProgressBarVisible} />
      </React.Fragment>)
  }
}
