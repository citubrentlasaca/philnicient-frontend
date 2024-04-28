import React, { useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate, Link } from 'react-router-dom'
import { decrypt } from '../Utilities/utils'
import api from '../Utilities/api';
import SmallLoading from '../Components/SmallLoading'

function ContentManagementHeader() {
    const navigate = useNavigate();
    const role = decrypt(sessionStorage.getItem('role'));
    const [loading, setLoading] = useState(false);

    const handleLogoutClick = async () => {
        try {
            setLoading(true);
            await api.post('/users/logout');
            sessionStorage.clear();
            navigate('/login');
        } catch (error) {
            //console.error(error);
            setLoading(false);
        }
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
                    "Logout"
                )}            </button>
        </div>
    )
}

export default ContentManagementHeader