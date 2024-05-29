import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password } from '../actions/auth';
import { FaUser } from 'react-icons/fa'; // Import de l'icône Facebook.
import Swal from 'sweetalert2'; // Import de SweetAlert2

const ResetPassword = ({ reset_password }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        email: ''
    });
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    const { email } = formData;

    useEffect(() => {
        setIsButtonEnabled(email.length > 0);
    }, [email]);

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
        } else {
            reset_password(email);
            setRequestSent(true);
        }
    };

    if (requestSent) {
        return <Redirect to='/' />;
    }

    return (
        <div className='container mt-5'>
            <h1>Reset Password</h1>
            <p>There is nothing to worry about, we'll send you a message to help you reset your password</p>
            <form onSubmit={onSubmit}>
                <div className="input-box">
                    <input 
                        type="text" 
                        placeholder='Email' 
                        name='email' 
                        value={email} 
                        onChange={onChange} 
                        required 
                    />
                    <FaUser className='icon' />
                </div>
                <p className='mt-3'>
                    Go To Sign In? <Link to='/login'>Sign In</Link>
                </p>
                <button 
                    className='btn login-button' 
                    type='submit' 
                    disabled={!isButtonEnabled}
                >
                    Confirm
                </button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password })(ResetPassword);
