import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions/auth';
import axios from 'axios';
import { FaFacebook, FaUser, FaLock, FaGoogle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Login.css';

const Login = ({ login, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    const { email, password } = formData;

    useEffect(() => {
        setIsButtonEnabled(email.length > 0 && password.length > 0);
    }, [email, password]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        
        // Regular expression to validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid email address.',
                confirmButtonText: 'OK'
            });
        } else if (password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password must be at least 8 characters long.',
                confirmButtonText: 'OK'
            });
        } else {
            login(email, password);
        }
    };

    const continueWithGoogle = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/o/google-oauth2/?redirect_uri=${process.env.REACT_APP_API_URL}/google`);
            window.location.replace(res.data.authorization_url);
        } catch (err) {
            console.error("Error during Google authentication:", err);
        }
    };

    if (isAuthenticated) {
        return <Redirect to='/test-execution' />;
    }

    return (
        <div className='container mt-5'>
            <h1>Welcome !</h1>
            <form onSubmit={onSubmit}>
                <div className="input-box">
                    <input type="text" placeholder='Email' name='email' value={email} onChange={onChange} required />
                    <FaUser className='icon'/>
                </div>              
                <div className="input-box">
                    <input type="password" placeholder='Password' name='password' value={password} onChange={onChange} required />
                    <FaLock className='icon' />
                </div>

                <p className='mt-3'>
                    Forgot your Password? <a href='/reset-password'>Reset Password</a>
                </p>
                <button className='btn login-button' type='submit' disabled={!isButtonEnabled}>Login</button>
            </form>
            <div className='mt-3' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button className='btn btn-danger' onClick={continueWithGoogle}>
                    <FaGoogle style={{ marginRight: '8px' }} /> Continue With Google
                </button>
                <br />
            </div>
            <p className='mt-4'>
                Don't have an account? <Link to='/signup'>Sign Up</Link>
            </p>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);
