import React, { Component } from 'react'
import mime from 'mime-types'
import { Modal, Input, Button, Icon } from 'semantic-ui-react'

export default class DecryptImage extends Component {
    state = {
        passcode: '',
    }
    handlePasscode = event => {
        this.setState({ passcode: event.target.value });
    }
    sendFile = () => {
        const { passcode } = this.state;
        const { decryptFile, closeModal } = this.props;
        decryptFile(passcode);
        closeModal();
        this.clearFile();
    }

    clearFile = () => this.setState({ file: null });
    isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename));
    render() {
        const { modal, closeModal } = this.props;
        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Enter Passcode to Decrypt Image</Modal.Header>
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
                </Modal.Actions>
            </Modal>
        )
    }
}
