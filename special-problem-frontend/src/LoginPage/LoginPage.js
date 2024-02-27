import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { Link } from 'react-router-dom'

function LoginPage() {
    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-4'
            style={{
                backgroundColor: colors.darkest,
            }}
        >
            <img src={logo} alt="Logo"
                style={{
                    width: "50px",
                    height: "50px",
                }}
            />
            <div className='w-25 p-4 d-flex flex-column justify-content-center align-items-center gap-4 rounded'
                style={{
                    backgroundColor: colors.light,
                }}
            >
                <b>Login To Your Account</b>
                <form className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <div className="w-100">
                        <label htmlFor="UsernameInput" className="form-label">Username</label>
                        <input type="text" className="form-control" id="UsernameInput" />
                    </div>
                    <div className="w-100">
                        <label htmlFor="PasswordInput" className="form-label">Password</label>
                        <input type="password" className="form-control" id="PasswordInput" />
                    </div>
                    <button type="submit" className="btn btn-primary"
                        style={{
                            width: "100px",
                            borderRadius: "10px",
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            color: colors.darkest,
                        }}
                    >
                        Log In
                    </button>
                </form>
                <p>Don't have an account yet? Sign up <Link to="/register" style={{ textDecoration: "none", color: colors.accent }}>here.</Link></p>
            </div>
        </div>
    )
}

export default LoginPage