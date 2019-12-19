import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import 'semantic-ui-css/semantic.min.css';
import firebase from './firebase';
import { createStore } from 'redux';
import { Provider,connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';
import Spinner from './Spinner'

import {setUser} from './actions/index';
const store = createStore(rootReducer, composeWithDevTools());
class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push('/');
            }
        })
    }
    render() {
        return this.props.isLoading ? <Spinner/>: (

            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />

            </Switch>

        );
    }

}
const mapStateToProps = state =>({
    isLoading:state.user.isLoading,

})
const RootWithRouter = withRouter(connect(mapStateToProps,{setUser})(Root));

ReactDOM.render(<Provider store={store}>
    <Router>
        <RootWithRouter />
    </Router>
</Provider>, document.getElementById('root')
);
serviceWorker.unregister();
