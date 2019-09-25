import React, { Component } from 'react'
import { Grid, Form, Segment, Button, Message, Icon, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
export default class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    errors: []
  };
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      error = { message: 'Fill in all fields' };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: 'Password is invalid' };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };
  isFormEmpty = ({ username, email, password, passwordConfirm }) => {
    return !username.length || !email.length || !password.length || !passwordConfirm.length;
  }
  isPasswordValid = ({ password, passwordConfirm }) => {
    if (password.length < 6 || passwordConfirm.length < 6) {
      return false;
    }
    else if (password !== passwordConfirm) {
      return false;
    }
    else {
      return true;
    }
  }
  handleSubmit = event => {
    if (this.isFormValid()) {
      event.preventDefault();
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
        })
        .catch(err => {
          console.log(err);
        });

    }
  };
  displayErrors = errors => errors.map((error, i) => (
    <p key={i}>{error.message}</p>
  ));
  render() {
    const { username, email, password, passwordConfirm,errors } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="black" textAlign="center" className=" font-rale">
            <Icon name="fire" color="black" />
            Register For DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked >
              <Form.Input fluid name="username" value={username} icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} type="text" />
              <Form.Input fluid name="email" value={email} icon="mail" iconPosition="left" placeholder="Email" onChange={this.handleChange} type="email" />
              <Form.Input fluid name="password" value={password} icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password" />
              <Form.Input fluid name="passwordConfirm" value={passwordConfirm} icon="repeat" iconPosition="left" placeholder="Confirm Password" onChange={this.handleChange} type="password" />
              <Button color="black" fluid size="large" className=" font-rale">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message className="font-rale">Already a User?<Link to="/login">Login</Link></Message>
        </Grid.Column>

      </Grid>
    )
  }
}

