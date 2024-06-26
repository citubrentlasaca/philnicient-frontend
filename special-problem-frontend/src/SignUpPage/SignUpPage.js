import React, { useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import SmallLoading from '../Components/SmallLoading';
import api from '../Utilities/api';

function SignUpPage() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    }

    const handleMiddleNameChange = (event) => {
        setMiddleName(event.target.value);
    }

    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
        setUsernameError(false);
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setUsernameError(false);
    }

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    const handleSignUp = async () => {
        setLoading(true);
        try {
            await api.post('/users', {
                firstname: firstName,
                middlename: middleName,
                lastname: lastName,
                email: email,
                username: username,
                password: password,
                role: role
            });
            navigate('/login');
        }
        catch (error) {
            // console.error('Error creating user:', error);
            setUsernameError(true);
            setLoading(false);
        }
    }

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-4'
            style={{
                backgroundColor: colors.darkest,
            }}
        >
            <Link to="/">
                <img src={logo} alt="Logo"
                    style={{
                        width: "50px",
                        height: "50px",
                    }}
                />
            </Link>
            <div className='w-50 p-4 d-flex flex-column justify-content-center align-items-center gap-4 rounded'
                style={{
                    backgroundColor: colors.light,
                }}
            >
                <b>Create Your Account</b>
                <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                        <div className="w-100">
                            <label htmlFor="FirstNameInput" className="form-label">First Name</label>
                            <input type="text" className="form-control" id="FirstNameInput" onChange={handleFirstNameChange} />
                        </div>
                        <div className="w-100">
                            <label htmlFor="MiddleNameInput" className="form-label">Middle Name</label>
                            <input type="text" className="form-control" id="MiddleNameInput" onChange={handleMiddleNameChange} />
                        </div>
                        <div className="w-100">
                            <label htmlFor="LastNameInput" className="form-label">Last Name</label>
                            <input type="text" className="form-control" id="LastNameInput" onChange={handleLastNameChange} />
                        </div>
                    </div>
                    <div className="w-100">
                        <label htmlFor="RoleInput" className="form-label">Role</label>
                        <select className="form-select" id='RoleInput' defaultValue="Placeholder" onChange={handleRoleChange}>
                            <option value="Placeholder" disabled>Select a role</option>
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                        </select>
                    </div>
                    <div className="w-100">
                        <label htmlFor="emailInput" className="form-label">Email Address</label>
                        <input type="text" className="form-control" id="emailInput" style={{ borderColor: usernameError && colors.wrong }} onChange={handleEmailChange} />
                        {usernameError ? <p className='mb-0' style={{ color: colors.wrong, fontSize: "12px" }}>Email Address/Username already exists.</p> : null}
                    </div>
                    <div className="w-100">
                        <label htmlFor="UsernameInput" className="form-label">Username</label>
                        <input type="text" className="form-control" id="UsernameInput" style={{ borderColor: usernameError && colors.wrong }} onChange={handleUsernameChange} />
                        {usernameError ? <p className='mb-0' style={{ color: colors.wrong, fontSize: "12px" }}>Email Address/Username already exists.</p> : null}
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
                    <button type="button" className="btn btn-primary" onClick={handleSignUp}
                        style={{
                            width: "100px",
                            height: "40px",
                            borderRadius: "10px",
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            color: colors.darkest,
                        }}
                    >
                        {loading ? (
                            <SmallLoading />
                        ) : (
                            <p>Sign Up</p>
                        )}
                    </button>
                </div>
                <p>Already have an account? Log in <Link to="/login" style={{ textDecoration: "none", color: colors.accent }}>here.</Link></p>
            </div>
        </div>
    )
}

export default SignUpPage