import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';

const Navbar = ({ logout, isAuthenticated, user }) => {
    console.log('Navbar user:', user);

    const [redirect, setRedirect] = useState(false);

    const logout_user = () => {
        logout();
        setRedirect(true);
    };

    const tpm_focus = () => {
        if (isAuthenticated) {
            window.location.href = 'http://localhost:3000/';
        }
    };

    const authLinks = (
        <Fragment>
            <li className='nav-item'>
                <a className='nav-link' href='http://localhost:3000/' onClick={tpm_focus}>TPM Focus</a>
            </li>
            {user && user.is_staff && (
                <li className='nav-item'>
                    <Link className='nav-link' to='/users'>Users</Link>
                </li>
            )}
            <li className='nav-item'>
                <a className='nav-link' href='/' onClick={logout_user}>Logout</a>
            </li>
        </Fragment>
    );

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Fragment>
            <nav className='navbar navbar-expand-lg navbar-light bg-light'>
                <Link className='navbar-brand' to='/'>TPM</Link>
                <button 
                    className='navbar-toggler' 
                    type='button' 
                    data-toggle='collapse' 
                    data-target='#navbarNav' 
                    aria-controls='navbarNav' 
                    aria-expanded='false' 
                    aria-label='Toggle navigation'
                >
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarNav'>
                    <ul className='navbar-nav'>
                        <li className='nav-item active'>
                            <Link className='nav-link' to='/'>Home <span className='sr-only'>(current)</span></Link>
                        </li>
                        {authLinks}
                    </ul>
                </div>
            </nav>
            {redirect && <Redirect to='/' />}
        </Fragment>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
});

export default connect(mapStateToProps, { logout })(Navbar);
