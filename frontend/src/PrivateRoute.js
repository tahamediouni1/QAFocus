// PrivateRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && user && user.is_staff ? (
          <Component {...props} />
        ) : (
          <Redirect to="/not-authorized" />
        )
      }
    />
  );
};

export default PrivateRoute;
