import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate } from 'react-router-dom'

function HomepageHeader() {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        localStorage.clear();
        navigate('/login');
    }


    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <img src={logo} alt="Logo"
                style={{
                    height: "50px",
                    width: "50px"
                }}
            />
            <button className="btn btn-primary" type="button" onClick={handleLogoutClick}
                style={{
                    width: "100px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                Logout
            </button>
        </div>
    )
}

export default HomepageHeader