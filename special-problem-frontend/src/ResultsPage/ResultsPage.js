import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../Icons/logo.png'
import colors from '../colors'
import Header from '../Components/Header'

function ResultsPage() {
    useEffect(() => {
        const modalBackdrop = document.querySelector('.modal-backdrop.fade.show');
        if (modalBackdrop) {
            modalBackdrop.parentNode.removeChild(modalBackdrop);
        }
    }, []);

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <Header />
            <div className='w-50 h-100 d-flex flex-column justify-content-center align-items-center gap-4'
                style={{
                    height: "calc(100% - 100px)",
                }}
            >
                <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <img src={logo} alt="Logo"
                        style={{
                            width: "100px",
                            height: "100px",
                        }}
                    />
                    <h1 style={{ fontWeight: "bold" }}>Thanks!</h1>
                </div>
                <p className='text-center'>Your assessment was submitted. Your result will be available once the teacher has finished reviewing your submission.</p>
                <Link to='/home'>
                    <button className='btn btn-primary'
                        style={{
                            color: colors.dark,
                            backgroundColor: colors.accent,
                            border: "none",
                            width: "200px"
                        }}>
                        Go back to home
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default ResultsPage