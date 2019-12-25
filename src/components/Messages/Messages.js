import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'
import { connect } from 'react-redux'
import { setUserPosts } from '../../actions'
import Typing from './Typing'
import Skeleton from './Skeleton'
class Messages extends Component {
  state = {
    isPrivateChannel: this.props.isPrivateChannel,
    typingRef: firebase.database().ref('typing'),
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messageRef: firebase.database().ref('messages'),
    connectedRef: firebase.database().ref('.info/connected'),
    usersRef: firebase.database().ref('users'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    typingUsers: [],
    messagesLoading: true,
    isChannelstarred: false,
    progressbar: false,
    numUniqueUser: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    listeners: []
  }
  componentDidMount() {
    const { channel, user, listeners } = this.state;
    if (channel && user) {
      this.addListener(channel.id);
      this.removeListeners(listeners)
      this.addUsersStarListener(channel.id, user.uid);
    }
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event;
    })
    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }
  addListener = (channelId) => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  }

  addTypingListener = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, this.state.typingRef, 'child_removed');

    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers })
      }
    });

    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef.child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.log(err);
            }
          })
      }
    })

  }

  addUsersStarListener = (channelId, userId) => {
    this.state.usersRef.child(userId).child('starred').once('value').then((data) => {
      if (data.val() !== null) {
        const channelIds = Object.keys(data.val());
        const prevStarred = channelIds.includes(channelId);
        this.setState({ isChannelstarred: prevStarred });
      }
    });
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
      this.countUserPosts(LoadedMessages);
    })

    this.addToListeners(channelId, ref, 'child_added');
  };

  handleStar = () => {
    this.setState(prevState => ({
      isChannelstarred: !prevState.isChannelstarred
    }), () => {
      this.starChannel();
    });
  }

  starChannel = () => {
    if (this.state.isChannelstarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]: {
            name: this.state.channel.name,
            details: this.state.channel.details,
            createdBy: {
              name: this.state.channel.createdBy.name,
              avatar: this.state.channel.createdBy.avatar
            }
          }
        })
    }
    else {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).child(this.state.channel.id).remove(err => {
        if (err !== null) console.log(err);
      });
    }
  }
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

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      }
      else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});

    this.props.setUserPosts(userPosts);
  }
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

  displayTypingUsers = (users) => (
    users.length > 0 && users.map(user => (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }} key={user.id}>
        <span className="user__typing">{user.name} is Typing</span> <Typing />
      </div>
    )
    )
  );

  displayMessageSkeleton = loading => (
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null)


  render() {
    const { messageRef, messages, channel, user, progressbar, numUniqueUser, searchTerm, messagesLoading, searchResults, searchLoading, isPrivateChannel, isChannelstarred, typingUsers } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader handleStar={this.handleStar} isChannelstarred={isChannelstarred} isPrivateChannel={isPrivateChannel} searchLoading={searchLoading} handleSearchChange={this.handleSearchChange} channelName={this.displayChannelName(channel)} users={numUniqueUser} />
        <Segment>
          <Comment.Group className={progressbar ? 'messages__progress' : ' messages'}>
            {/* messages */}
            {this.displayMessageSkeleton(messagesLoading)}
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} isPrivateChannel={isPrivateChannel} messageRef={messageRef} currentUser={user} currentChannel={channel} isProgressBarVisible={this.isProgressBarVisible} />
      </React.Fragment>)
  }
}

export default connect(null, { setUserPosts })(Messages);
