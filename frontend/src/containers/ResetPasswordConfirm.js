import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password_confirm } from '../actions/auth';
import { FaLock } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import de SweetAlert2

const ResetPasswordConfirm = ({ match, reset_password_confirm }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: ''
    });
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const { new_password, re_new_password } = formData;

    useEffect(() => {
        // Vérifie si les champs sont vides pour désactiver ou activer le bouton
        if (new_password === '' || re_new_password === '') {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    }, [new_password, re_new_password]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();

        // Vérifier si le mot de passe respecte la longueur minimale
        if (new_password.length < 8 || re_new_password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password must be at least 8 characters long.',
                confirmButtonText: 'OK'
            });
        } else if (new_password !== re_new_password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match.',
                confirmButtonText: 'OK'
            });
        } else {
            const uid = match.params.uid;
            const token = match.params.token;
            reset_password_confirm(uid, token, new_password, re_new_password);
            setRequestSent(true);
        }
    };

    if (requestSent) {
        return <Redirect to='/' />
    }

    return (
        <div className='container mt-5'>
            <form onSubmit={e => onSubmit(e)}>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder='New Password'
                        name='new_password'
                        value={new_password}
                        onChange={e => onChange(e)}
                        required
                    />
                    <FaLock className='icon' />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder='Confirm New Password'
                        name='re_new_password'
                        value={re_new_password}
                        onChange={e => onChange(e)}
                        required
                    />
                    <FaLock className='icon' />
                </div>
                <button
                    className='btn login-button'
                    type='submit'
                    disabled={isButtonDisabled}
                >
                    Reset Password
                </button>
                <p className='mt-3'>
                    Already have an account? <Link to='/login'>Sign In</Link>
                </p>
            </form>
        </div>
    );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);
