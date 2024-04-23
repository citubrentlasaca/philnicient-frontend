import React, { useEffect, useState } from 'react'
import AccountManagementHeader from './AccountManagementHeader'
import NormalLoading from '../Components/NormalLoading';
import colors from '../colors'
import { useNavigate } from 'react-router-dom';
import api from '../Utilities/api';
import { decrypt } from '../Utilities/utils'

function AccountManagementPage() {
    const navigate = useNavigate();
    const role = decrypt(sessionStorage.getItem('role'), "PHILNICIENT");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [idToDelete, setIdToDelete] = useState('');
    const [roleToDelete, setRoleToDelete] = useState('');

    useEffect(() => {
        if (role !== 'Admin') {
            navigate('/page-not-found')
        }
    }, [role, navigate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await api.get(`/users`);
                const filteredUsers = users.data.filter(user => user.firstname !== "Admin");

                setUsers(filteredUsers);
                setFilteredUsers(filteredUsers);
                setLoading(false);
            } catch (error) {
                // console.error('Error fetching users:', error);
            }
        }

        fetchUsers();
    }, []);

    const filterUsers = input => {
        setSearchInput(input);
        const filtered = users.filter(user =>
            user.firstname.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const handleDeleteUserClick = (id, role) => {
        setIdToDelete(id);
        setRoleToDelete(role);
    }

    const deleteUser = async () => {
        try {
            if (roleToDelete === 'Student') {
                await api.delete(`/users/${idToDelete}/delete-student`);
            }
            else if (roleToDelete === 'Teacher') {
                await api.delete(`/users/${idToDelete}/delete-teacher`);
            }
            navigate(0);
        }
        catch (error) {
            // console.error('Error deleting user:', error);
        }
    }

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <div className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this user?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>No</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={deleteUser} style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>
            <AccountManagementHeader />
            {loading ? (
                <NormalLoading />
            ) : (
                <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                    style={{
                        height: "calc(100% - 100px)",
                        overflowY: "auto",
                    }}
                >
                    <div className="input-group mb-3 w-75">
                        <span className="input-group-text" id="basic-addon1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                            </svg>
                        </span>
                        <input type="text" className="form-control" placeholder="Search User" aria-describedby="basic-addon1" value={searchInput} onChange={e => filterUsers(e.target.value)} />
                    </div>
                    <div className='w-75 d-flex flex-column justify-content-between align-items-start gap-2'>
                        <table className="table align-middle text-center">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Username</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.firstname} {user.middlename} {user.lastname}</td>
                                        <td>{user.email}</td>
                                        <td>{user.username}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <button type='button' className='btn' data-bs-toggle="modal" data-bs-target="#staticBackdrop" onClick={() => handleDeleteUserClick(user.id, user.role)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.wrong} className="bi bi-person-x-fill" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AccountManagementPage