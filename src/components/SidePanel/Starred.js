import React, { Component } from 'react'
import { connect } from 'react-redux'
import firebase from '../../firebase'
import { setCurrentChannel, setPrivateChannel } from '../../actions/index'
import { Menu, Icon } from 'semantic-ui-react'

class Starred extends Component {
    state = {
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        activeChannel: '',
        starredChannels: []
    }
    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }
    componentWillUnmount() {
        this.removeListener();
    }
    removeListener = ()=>{
        this.state.userRef.child(`${this.state.user.uid}/starred`).off();
    }
    addListeners = (userId) => {
        this.state.userRef.child(userId).child('starred').on('child_added', snap => {
            const starredChannel = {
                id: snap.key, ...snap.val()
            };
            this.setState({
                starredChannels: [...this.state.starredChannels, starredChannel]
            });
        });
        this.state.userRef.child(userId).child('starred').on('child_removed', snap => {
            const channelToRemove = { id: snap.key, ...snap.val() };
            const filteredChannel = this.state.starredChannels.filter(channel => {
                return channel.id !== channelToRemove.id;
            });
            this.setState({ starredChannels: filteredChannel });
        });


    }
    setActiveChannel = (channel) => {
        this.setState({ activeChannel: channel.id });
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    displayChannels = (channels) => (channels.length > 0 && channels.map(channel => (
        <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name} style={{ opacity: 1 }} active={channel.id === this.state.activeChannel}>

            # {channel.name}
        </Menu.Item>
    )));
    render() {
        const { starredChannels } = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="star" /> Starred
        </span>{" "}
                    ({starredChannels.length})
        </Menu.Item>
                {/* channels */}
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}
export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
