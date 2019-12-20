import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'
import ProgressBar from './ProgressBar'
export default class Messages extends Component {
  state = {
    messageRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressbar: false
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
    this.state.messageRef.child(channelId).on('child_added', snap => {
      LoadedMessages.push(snap.val());
      this.setState({
        messages: LoadedMessages,
        messagesLoading: false
      });
    })
  };
  displayMessages = messages => (
    messages.length > 0 && messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />

    ))
  )
  isProgressBarVisible = (percent) => {
    if (percent > 0) {
      this.setState({ progressbar: true });
    }
  }

  render() {
    const { messageRef, messages, channel, user, progressbar } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader />
        <Segment>
          <Comment.Group className={progressbar ? 'messages__progress' : ' messages'}>
            {/* messages */}

            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm messageRef={messageRef} currentUser={user} currentChannel={channel} isProgressBarVisible={this.isProgressBarVisible} />
      </React.Fragment>)
  }
}
