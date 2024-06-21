import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TestExecution from './pages/TestExecution';
import Home from './containers/Home/Home';
import Login from './containers/Login/Login';
import Signup from './containers/Signup/Signup';
import Activate from './containers/Activate';
import ResetPassword from './containers/ResetPassword';
import ResetPasswordConfirm from './containers/ResetPasswordConfirm';
import Facebook from './containers/Facebook';
import Google from './containers/Google';
import UserList from './containers/Users/Users';
import NotAuthorized from './NotAuthorized';
import PrivateRoute from './PrivateRoute';
import './App.css';
import { Provider } from 'react-redux';
import store from './store';
import Dashboard from './pages/Dashboard';
import Layout from './hocs/Layout';

const App = () => (
  <Provider store={store}>
    <Router>
      <Layout>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/signup' component={Signup} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/projects/:projectId/testruns" component={TestExecution} />
          <Route exact path='/facebook' component={Facebook} />
          <Route exact path='/google' component={Google} />
          <Route exact path='/reset-password' component={ResetPassword} />
          <Route exact path='/password/reset/confirm/:uid/:token' component={ResetPasswordConfirm} />
          <Route exact path='/activate/:uid/:token' component={Activate} />
          <PrivateRoute path='/users' component={UserList} />
          <Route path='/not-authorized' component={NotAuthorized} />
        </Switch>
      </Layout>
    </Router>
  </Provider>
);

export default App;
