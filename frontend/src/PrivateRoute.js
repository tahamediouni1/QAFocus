// PrivateRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, auth, ...rest }) => {
  const { isAuthenticated } = auth;
  return (
    <Route 
      {...rest} 
      render={props => 
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to='/not-authorized' />
        )
      } 
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
