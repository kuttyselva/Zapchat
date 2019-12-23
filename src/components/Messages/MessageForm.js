import React, { Component } from 'react'
import { Segment, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
export default class MessageForm extends Component {
    state = {
        message: '',
        percentUpload: 0,
        user: this.props.currentUser,
        loading: false,
        channel: this.props.currentChannel,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref()
    };

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }
    sendReply = () => {
        const { getMessagesRef } = this.props;
        const { message, channel } = this.state;
        if (message) {
            //sending message
            this.setState({ loading: true });
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: '', errors: [] });
                })
                .catch((err) => {
                    console.log(err);
                    this.setState({ loading: false, errors: this.state.concat(err) })
                });
        }
        else {
            this.setState({
                errors: this.state.errors.concat({ message: 'add a message' })
            });
        }
    }
    createMessage = (fileUrl = null) => {
        const { user } = this.state;
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL
            }
        };
        if (fileUrl !== null) {
            message['image'] = fileUrl;
        }
        else {
            message['content'] = this.state.message;
        }
        return message;
    }
    getPath = () =>{
        if(this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`;
        }
        else{
            return 'chat/public';
        }
    }
    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
            () => {
                this.state.uploadTask.on('state_changed', snap => {
                    const percentUpload = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                    this.props.isProgressBarVisible(percentUpload);
                    this.setState({ percentUpload });
                },
                    err => {
                        console.log(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null
                        })
                    }, () => {
                        this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                            this.sendFileMessage(downloadUrl, ref, pathToUpload);
                        })
                            .catch(
                                err => {
                                    console.log(err);
                                    this.setState({
                                        errors: this.state.errors.concat(err),
                                        uploadState: "error",
                                        uploadTask: null
                                    })
                                })
                    }
                )
            }
        )
    };

    sendFileMessage = (fileUrl, ref, path) => {
        ref.child(path)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: 'done' })
            })
            .catch(err => {
                console.log(err);
                this.setState({ errors: this.state.errors.concat(err) })
            })
    };

    render() {
        const { errors, message, loading, modal, uploadState, percentUpload } = this.state;
        return (
            <Segment className="message__form">
                <Input fluid name="message" className={
                    errors.some(error => error.message.includes('message')) ? 'error' : ''
                }
                    onChange={this.handleChange}
                    value={message}
                    style={{ marginBottom: '0.7em' }}
                    label={<Button icon="add" />}
                    labelPosition="left"
                    placeholder="Write Your Message" />
                <Button.Group icon widths="2">
                    <Button onClick={this.sendReply} disabled={loading} color="orange" content="Add Reply" labelPosition="left" icon="edit" />
                    <Button color="teal" disabled={uploadState==='uploading'} onClick={this.openModal} content="upload media" labelPosition="right" icon="cloud upload" />
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar uploadState={uploadState} percent={percentUpload} />
            </Segment>
        )
    }
}
