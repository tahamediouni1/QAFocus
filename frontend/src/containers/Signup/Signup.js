import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { signup } from '../../actions/auth';
import axios from 'axios';
import { FaFacebook, FaUser, FaLock, FaGoogle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Signup.css';

const Signup = ({ signup, isAuthenticated }) => {
    const [accountCreated, setAccountCreated] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        re_password: ''
    });

    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    const { first_name, last_name, email, password, re_password } = formData;

    useEffect(() => {
        setIsButtonEnabled(
            first_name.length > 0 &&
            last_name.length > 0 &&
            email.length > 0 &&
            password.length > 0 &&
            re_password.length > 0
        );
    }, [first_name, last_name, email, password, re_password]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Fonction de validation de l'e-mail
    const validateEmail = email => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
    };
    const onSubmit = e => {
        e.preventDefault();

        if (first_name === last_name) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'First name and last name must be different.',
                confirmButtonText: 'OK'
            });
        } else if (!validateEmail(email)) { // Vérification de l'e-mail
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter a valid email address.',
                confirmButtonText: 'OK'
            });
        } else if (password !== re_password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match.',
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
            signup(first_name, last_name, email, password, re_password);
            setAccountCreated(true);
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
        return <Redirect to='/' />;
    }
    if (accountCreated) {
        return <Redirect to='/login' />;
    }

    return (
        <div className='container mt-5'>
            <h1>Create Your Account</h1>
            <form onSubmit={e => onSubmit(e)}>
                <div className="input-box">
                    <input type="text" placeholder='First Name' name='first_name' value={first_name} onChange={e => onChange(e)} required />
                    <FaUser className='icon' />
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Last Name' name='last_name' value={last_name} onChange={e => onChange(e)} required />
                    <FaUser className='icon' />
                </div>
                <div className="input-box">
                    <input type="text" placeholder='Email' name='email' value={email} onChange={e => onChange(e)} required />
                    <FaUser className='icon' />
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Password' name='password' value={password} onChange={e => onChange(e)} required />
                    <FaLock className='icon' />
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Confirm Password' name='re_password' value={re_password} onChange={e => onChange(e)} required />
                    <FaLock className='icon' />
                </div>
                <button className='btn' type='submit' disabled={!isButtonEnabled}>Register</button>
            </form>
            <br />
            <button className='btn btn-danger' onClick={continueWithGoogle}>
                <FaGoogle style={{ marginRight: '8px' }} /> Continue With Google
            </button>
            <br />
            <br />
            <p className='mt-3'>
                Already have an account? <Link to='/login'>Sign In</Link>
            </p>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { signup })(Signup);


