import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../Icons/logo.png'
import colors from '../colors'

function PageNotFound() {
    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-4'
            style={{
                backgroundColor: colors.darkest,
            }}
        >
            <div className='d-flex flex-column justify-content-center align-items-center gap-2'>
                <Link to="/home">
                    <img src={logo} alt="Logo"
                        style={{
                            width: "100px",
                            height: "100px",
                        }}
                    />
                </Link>
                <h1 style={{
                    fontWeight: 'bold',
                    color: colors.accent,
                }}>
                    Oops! Page Not Found
                </h1>
            </div>
            <div className='d-flex flex-column justify-content-center align-items-center gap-2'
                style={{
                    color: colors.light,
                }}
            >
                <p>We couldn't find what you were looking for.</p>
                <p>It seems like you've wandered off the path. Don't worry, let's get you back on track:</p>
                <ol style={{
                    textAlign: 'left'
                }}>
                    <li><strong>Check the URL:</strong> Ensure you've entered the correct web address.</li>
                    <li><strong>Go back:</strong> Use your browser's back button to return to the previous page.</li>
                    <li><strong>Homepage:</strong> Head back to the <Link to="/home" style={{ color: colors.accent, textDecoration: "none" }}>Philnicient Homepage</Link> to explore more.</li>
                </ol>
            </div>
        </div>
    )
}

export default PageNotFound