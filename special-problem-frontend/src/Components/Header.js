import React, { useEffect, useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { decrypt } from '../Utilities/utils'
import api from '../Utilities/api';
import SmallLoading from '../Components/SmallLoading'

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const role = sessionStorage.getItem('role');
        if (role !== "Teacher" && role !== "Student") {
            const adminRole = decrypt(role)
            setRole(adminRole)
        }
        else {
            setRole(role)
        }
    }, [role]);

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
                {role === 'Student' && location.pathname !== "/results" &&
                    <>
                        <Link to="/instructions" style={{ textDecoration: "none" }}>
                            <p style={{ color: colors.accent }}>Instructions</p>
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
                {loading ? (
                    <SmallLoading />
                ) : (
                    "Logout"
                )}
            </button>
        </div>
    )
}

export default Header