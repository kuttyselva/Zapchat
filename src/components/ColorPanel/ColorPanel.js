import React, { Component } from 'react'
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react'
import { SliderPicker } from 'react-color'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import {setColors} from '../../actions/index'
class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    userColors: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  }

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  addListener = (userId) => {
    let userColors = [];
    this.state.usersRef
      .child(`${userId}/colors`)
      .on('child_added', snap => {
        userColors.unshift(snap.val());
        this.setState({ userColors });
      })
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handlePrimaryColor = (color) => this.setState({ primary: color.hex });

  handleSecondarycolor = (color) => this.setState({ secondary: color.hex });

  handleSaveColor = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  }

  saveColors = (primary, secondary) => {
    this.state.usersRef.child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary, secondary
      })
      .then(() => {
        console.log("added");
        this.closeModal();
      })
      .catch(err => console.log(err));
  }

  displayColors = colors => (
    colors.length > 0 && colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div className="color__container" onClick={()=> this.props.setColors(color.primary,color.secondary)}>
          <div className="color__square" style={{ background: color.primary }}>
            <div className="color__overlay" style={{ background: color.secondary }}>
            </div>
          </div>
        </div>
      </React.Fragment>
    ))
  )

  render() {
    const { modal, primary, secondary, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {/* color picker */}
        {this.displayColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <SliderPicker color={primary} onChange={this.handlePrimaryColor} />
            </Segment>
            <Segment inverted>
              <Label content="Secondary Color" />
              <SliderPicker color={secondary} onChange={this.handleSecondarycolor} />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColor}> <Icon name="checkmark" />Save Colors</Button>
            <Button color="red" onClick={this.closeModal} inverted> <Icon name="remove" /> Cancel</Button>

          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default connect(null, {setColors})(ColorPanel);
