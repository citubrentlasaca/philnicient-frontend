import React, { useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import SmallLoading from '../Components/SmallLoading'

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState(false)
    const [codeError, setCodeError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handleCodeChange = (e) => {
        setCode(e.target.value)
        setCodeError(false);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        setPasswordMatchError(false);
    }

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value)
        setPasswordMatchError(false);
    }

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleRequestCodeClick = () => {
        axios.post('http://127.0.0.1:5000/api/users/forgot-password', {
            email: email,
        })
            .then(response => {
            })
            .catch(error => {
                console.error('Error sending code:', error);
            });
    }

    const handleResetClick = () => {
        if (password !== confirmPassword) {
            setPasswordMatchError(true)
            setLoading(false);
        }
        else {
            setLoading(true);
            axios.post('http://127.0.0.1:5000/api/users/reset-password', {
                email: email,
                code: code,
                password: password,
            })
                .then(response => {
                    navigate('/login');
                })
                .catch(error => {
                    console.error('Error resetting password:', error);
                    setCodeError(true);
                    setLoading(false);
                });
        }
    }

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-4'
            style={{
                backgroundColor: colors.darkest,
            }}
        >
            <div className="modal fade" id="resetPasswordModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex flex-column justify-content-center align-items-center gap-2">
                            <p className='mb-0'>We have sent an email containing a code to reset your password. Please check your inbox.</p>
                            <div className="w-100">
                                <label htmlFor="codeInput" className="form-label">Code</label>
                                <input type="text" className="form-control" id="codeInput" onChange={handleCodeChange} />
                            </div>
                            <div className="w-100">
                                <label htmlFor="PasswordInput" className="form-label">Password</label>
                                <div className="input-group mb-3">
                                    <input type={showPassword ? "text" : "password"} id="PasswordInput" className="form-control" onChange={handlePasswordChange} />
                                    <button type='button' className='btn' onClick={handleShowPassword}>
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-eye-slash" viewBox="0 0 16 16">
                                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-eye" viewBox="0 0 16 16">
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="w-100">
                                <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
                                <div className="input-group mb-3">
                                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPasswordInput" className="form-control" onChange={handleConfirmPasswordChange} />
                                    <button type='button' className='btn' onClick={handleShowConfirmPassword}>
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-eye-slash" viewBox="0 0 16 16">
                                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-eye" viewBox="0 0 16 16">
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {codeError ? <p className='mb-0 text-center' style={{ color: colors.wrong, fontSize: "12px" }}>Code does not exist.</p> : null}
                            {passwordMatchError ? <p className='mb-0 text-center' style={{ color: colors.wrong, fontSize: "12px" }}>Passwords do not match.</p> : null}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" style={{ width: "100px", height: "40px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Cancel</button>

                            <button type="button" className="btn btn-primary" style={{ width: "100px", height: "40px", backgroundColor: colors.accent, color: colors.dark, border: "none" }} onClick={handleResetClick}>
                                {loading ? (
                                    <SmallLoading />
                                ) : (
                                    <p className='mb-0'>Reset</p>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Link to="/">
                <img src={logo} alt="Logo"
                    style={{
                        width: "50px",
                        height: "50px",
                    }}
                />
            </Link>
            <div className='w-25 p-4 d-flex flex-column justify-content-center align-items-center gap-4 rounded'
                style={{
                    backgroundColor: colors.light,
                }}
            >
                <b>Reset Your Password</b>
                <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <div className="w-100">
                        <label htmlFor="emailInput" className="form-label">Email Address</label>
                        <input type="text" className="form-control" id="emailInput" onChange={handleEmailChange} />
                    </div>
                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#resetPasswordModal" onClick={handleRequestCodeClick}
                        style={{
                            width: "200px",
                            borderRadius: "10px",
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            color: colors.darkest,
                        }}
                    >
                        Request Code
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage