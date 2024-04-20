import React, { useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate, Link } from 'react-router-dom'

function AccountManagementHeader() {
    const navigate = useNavigate();
    const userDataString = sessionStorage.getItem('userData');
    const userObject = JSON.parse(userDataString);
    const userData = userObject.user;
    const [role, setRole] = useState(userData.role);

    const handleLogoutClick = () => {
        sessionStorage.clear();
        navigate('/login');
    }

    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <div className='d-flex flex-row justify-content-center align-items-center gap-4'>
                <Link to="/home">
                    <img src={logo} alt="Logo"
                        style={{
                            height: "50px",
                            width: "50px"
                        }}
                    />
                </Link>
                {role === 'Admin' &&
                    <>
                        <Link to="/account-management" style={{ textDecoration: "none" }}>
                            <p style={{ color: colors.accent }}>Account Management</p>
                        </Link>
                        <Link to="/content-management" style={{ textDecoration: "none" }}>
                            <p style={{ color: colors.accent }}>Content Management</p>
                        </Link>
                    </>
                }
            </div>
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

export default AccountManagementHeader