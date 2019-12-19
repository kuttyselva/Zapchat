import React, { Component } from 'react'
import { Grid, Form, Segment, Button, Message, Icon, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
export default class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
  };
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };


  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
     firebase
     .auth()
     .signInWithEmailAndPassword(this.state.email,this.state.password)
     .then((signedInUser)=>{
      console.log(signedInUser);
      this.setState({loading:false});
     })
     .catch(err=>{
       console.log("err");
       this.setState({errors:this.state.errors.concat(err),loading:false});
     });

    }
  };
  isFormValid = ({email, password}) => email && password;

  displayErrors = errors => errors.map((error, i) => (
    <p key={i}>{error.message}</p>
  ));

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
  }
  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center" className=" font-rale">
            <Icon name="fire" color="violet" />
            Login to DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked >
              <Form.Input fluid name="email" className={this.handleInputError(errors, 'email')} value={email} icon="mail" iconPosition="left" placeholder="Email" onChange={this.handleChange} type="email" />
              <Form.Input fluid name="password" className={this.handleInputError(errors, 'password')} value={password} icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password" />
              <Button color="violet" disabled={loading} fluid size="large" className={loading ? 'loading' : 'font-rale'}>Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message className="font-rale">Not a User?<Link to="/register">register</Link></Message>
        </Grid.Column>

      </Grid>
    )
  }
}

