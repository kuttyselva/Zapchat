import React, { Component } from 'react'
import mime from 'mime-types'
import { Modal, Input, Button, Icon } from 'semantic-ui-react'

export default class FileModal extends Component {
    state = {
        file: null,
        passcode:'',
        authorized: ['image/jpg', 'image/png','image/jpeg']
    }
    handlePasscode = event =>{
        this.setState({passcode:event.target.value});
        console.log(event.target.value);
    }
    addFile = event => {
        const file = event.target.files[0];
        if (file) {
            this.setState({ file });
        }
    }
    sendFile = () => {
        const { file ,passcode} = this.state;
        const { uploadFile, closeModal } = this.props;
        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                const metadata = { contentType: mime.lookup(file.name) };
                uploadFile(file, metadata ,passcode);
                closeModal();
                this.clearFile();
            }
        }
    }

    clearFile = () => this.setState({ file: null });
    isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename));
    render() {
        const { modal, closeModal } = this.props;
        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input
                        onChange={this.addFile}
                        fluid
                        label="File types: jpg , png"
                        name="file" type="file" />
                </Modal.Content>
                <Modal.Content>
                    <Input
                        onChange={this.handlePasscode}
                        fluid
                        label="Enter Passcode"
                        value={this.state.passcode}
                        name="passcode" type="password" />
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.sendFile} color="green" inverted>
                        <Icon name="checkmark" /> Send
              </Button>
                    <Button color="red" inverted onClick={closeModal}>
                        <Icon name="remove" /> Cancel
              </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}
