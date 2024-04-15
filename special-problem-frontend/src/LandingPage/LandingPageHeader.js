import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { Link } from 'react-router-dom'

function LandingPageHeader() {
    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <Link to="/">
                <img src={logo} alt="Logo"
                    style={{
                        height: "50px",
                        width: "50px"
                    }}
                />
            </Link>
            <div className='d-flex flex-row justify-content-center align-items-center gap-2'>
                <Link to="/login">
                    <button className="btn btn-primary" type="button"
                        style={{
                            width: "100px",
                            borderRadius: "10px",
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            color: colors.darkest,
                        }}
                    >
                        Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="btn btn-primary" type="button"
                        style={{
                            width: "100px",
                            borderRadius: "10px",
                            backgroundColor: colors.accent,
                            borderColor: colors.accent,
                            color: colors.darkest,
                        }}
                    >
                        Sign Up
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default LandingPageHeader