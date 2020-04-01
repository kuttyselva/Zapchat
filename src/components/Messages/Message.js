import React, { Component } from 'react';
import { Comment, Image, Segment } from 'semantic-ui-react';
import moment from 'moment'
import DecryptImage from './DecryptImage';
import axios from 'axios'
import ImageViewer from 'react-simple-image-viewer';
import aesjs from 'aes-js';


export default class Message extends Component {
    state = {
        modal: false,
        url: '',
        isViewerOpen: false,
        imageData: '',
    }
    images = [];
    isOwnMessage = (message, user) => {
        return message.user.id === user.uid ? 'message__self' : '';
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

    decryptFile = (passcode) => {
        const data = new FormData()
        passcode = this.encryption(passcode);
        data.append('image_url', this.state.url);
        data.append('passcode', passcode);
        console.log(passcode, this.state.url);
        axios.post('http://localhost:5000/api/encrypt', data).then((data) => {
            this.setState({ imageData:'data:image/jpeg;base64,'+ data.data.status, isViewerOpen: true })
            console.log(data.data.status);
            this.images.push('data:image/jpeg;base64,'+data.data.status);
        })
    }

    isImage = (message) => {
        return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
    }
    imageClick = (url) => {
        console.log(url);
        this.setState({ modal: true, url: url });
    }
    closeModal = () => this.setState({ modal: false });
    closeImageViewer = () => {
        this.setState({ isViewerOpen: false });
    }
    timeFromNow = (timestamp) => moment(timestamp).fromNow();
    render() {
        const { message, user } = this.props;
        return (
            <Segment>
                <Comment>
                    <Comment.Avatar src={message.user.avatar} />
                    <Comment.Content className={this.isOwnMessage(message, user)}>
                        <Comment.Author as="a">{message.user.name}</Comment.Author>
                        <Comment.Metadata>{this.timeFromNow(message.timestamp)}</Comment.Metadata>
                        {this.isImage(message) ? <Image src={this.state.isViewerOpen ? this.state.imageData :message.image} onClick={() => { this.imageClick(message.image) }} className='message__image' /> :
                            <Comment.Text>{message.content}</Comment.Text>
                        }
                    </Comment.Content>
                </Comment>
                <DecryptImage
                    modal={this.state.modal}
                    closeModal={this.closeModal}
                    decryptFile={this.decryptFile}
                />
                {/* {this.state.isViewerOpen && (
                    <ImageViewer
                        src={this.images}
                        currentIndex={0}
                        onClose={this.closeImageViewer}
                    />
                )} */}
            </Segment>
        )
    }

}
