import React, { Component } from 'react'
import { Segment, Input, Button } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import aesjs from 'aes-js';
import axios from 'axios'
export default class MessageForm extends Component {
    state = {
        message: '',
        emojiPicker: false,
        percentUpload: 0,
        user: this.props.currentUser,
        loading: false,
        channel: this.props.currentChannel,
        errors: [],
        typingRef: firebase.database().ref('typing'),
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

    componentWillUnmount() {
        if (this.state.uploadTask != null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask: null });
        }
    }

    sendReply = () => {
        const { getMessagesRef } = this.props;
        const { message, channel, typingRef, user } = this.state;
        if (message) {
            //sending message
            this.setState({ loading: true });
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: '', errors: [] });
                    typingRef.child(channel.id)
                        .child(user.uid)
                        .remove();
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
    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.state.channel.id}`;
        }
        else {
            return 'chat/public';
        }
    }

    b64toBlob = (b64Data, contentType = '', sliceSize = 1024) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    encryption = (text) => {
        var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        var textBytes = aesjs.utils.utf8.toBytes(text);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var encryptedBytes = aesCtr.encrypt(textBytes);
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        console.log(encryptedHex);
        return encryptedHex;
    }
    decryption = (encryptedHex) => {
        var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
        var decryptedBytes = aesCtr.decrypt(encryptedBytes);
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        console.log(decryptedText);
        return decryptedText;
    }

    uploadFile = (file, metadata, passcode) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        let imageData;
        const encrypted = this.encryption(passcode);
        const decrypted = this.decryption(encrypted);
        console.log(encrypted, decrypted);
        const data = new FormData()
        data.append('image', file);
        data.append('passcode', encrypted);
        axios.post('http://localhost:5000/api/decrypt', data).then((data) => {
            console.log(data.data.status);
            imageData = this.b64toBlob(data.data.status, 'image/jpg');
            const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
            this.setState({
                uploadState: 'uploading',
                uploadTask: this.state.storageRef.child(filePath).put(imageData, metadata)
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
        })

    };

    handleKeyDown = (event) => {

        if (event.keyCode === 13) {
            this.sendReply();
        }
        const { message, typingRef, channel, user } = this.state;
        if (message) {
            typingRef.child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else {
            typingRef.child(channel.id)
                .child(user.uid)
                .remove();
        }
    }

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

    handlePicker = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker });
    };

    handleAddEmoji = (emoji) => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
        this.setState({ message: newMessage, emojiPicker: false });
        setTimeout(() => {
            this.messageInputRef.focus()
        }, 0);
    }

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };

    render() {
        const { errors, message, loading, modal, uploadState, percentUpload, emojiPicker } = this.state;
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker
                        set="twitter"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="pick your emoji"
                        emoji="point_up"
                    />
                )}
                <Input fluid name="message" className={
                    errors.some(error => error.message.includes('message')) ? 'error' : ''
                }
                    onChange={this.handleChange}
                    value={message}
                    ref={node => (this.messageInputRef = node)}
                    onKeyDown={this.handleKeyDown}
                    style={{ marginBottom: '0.7em' }}
                    label={<Button icon={emojiPicker ? 'close' : 'add'} content={emojiPicker ? 'close' : null} onClick={this.handlePicker} />}
                    labelPosition="left"
                    placeholder="Write Your Message" />
                <Button.Group icon widths="2">
                    <Button onClick={this.sendReply} disabled={loading} color="orange" content="Add Reply" labelPosition="left" icon="edit" />
                    <Button color="teal" disabled={uploadState === 'uploading'} onClick={this.openModal} content="upload media" labelPosition="right" icon="cloud upload" />
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
