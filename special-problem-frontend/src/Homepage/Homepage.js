import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import colors from '../colors'
import { Link, useNavigate } from 'react-router-dom';
import NormalLoading from '../Components/NormalLoading';
import api from '../Utilities/api';
import { decrypt } from '../Utilities/utils'

function Homepage() {
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('user_id');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true)
    const [className, setClassName] = useState('')
    const [classCode, setClassCode] = useState('')
    const [classCodeLoading, setClassCodeLoading] = useState(true)
    const [classes, setClasses] = useState([]);
    const [classCodeInput, setClassCodeInput] = useState('')
    const [classCodeError, setClassCodeError] = useState(false)
    const [buttonLoading, setButtonLoading] = useState(false)

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

    const handleClassNameChange = (e) => {
        setClassName(e.target.value)
    }

    const handleClassCodeInputChange = (e) => {
        setClassCodeInput(e.target.value)
        setClassCodeError(false)
    }

    const handleCreateClassClick = async () => {
        try {
            const response = await api.post('/classes', {
                classname: className,
                teacher_id: userId,
            });
            const classData = response.data;
            setClassCode(classData.classcode)
            setClassCodeLoading(false)
        }
        catch (error) {
            // console.error('Error creating class:', error);
        }
    }

    const handlePostClassCreation = () => {
        navigate(0);
    }

    const handleJoinClassClick = async () => {
        setButtonLoading(true);
        try {
            const response = await api.get(`/classes/code/${classCodeInput}`);
            const classData = response.data;
            const classId = classData.id;

            try {
                await api.post('/students', {
                    class_id: classId,
                    student_id: userId,
                });
                navigate(0);
            }
            catch (error) {
                // console.error('Error creating student:', error);
            }
        }
        catch (error) {
            // console.error('Error joining class:', error);
            setClassCodeError(true)
            setButtonLoading(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (role === 'Teacher') {
                const teacherClasses = [];
                try {
                    const allClasses = await api.get('/classes');
                    for (const classes of allClasses.data) {
                        if (classes.teacher_id === userId) {
                            teacherClasses.push(classes);
                        }
                    }

                    setClasses(teacherClasses);
                    setLoading(false);
                }
                catch (error) {
                    // console.error('Error fetching all classes:', error);
                }
            }
            else if (role === 'Student') {
                const students = [];
                try {
                    const allStudents = await api.get('/students');
                    for (const student of allStudents.data) {
                        if (student.student_id === userId) {
                            students.push(student);
                        }
                    }

                    const studentClasses = [];
                    for (const student of students) {
                        const allClasses = await api.get('/classes');
                        for (const classes of allClasses.data) {
                            if (classes.id === student.class_id) {
                                studentClasses.push(classes);
                            }
                        }
                    }

                    setClasses(studentClasses);
                    setLoading(false);
                }
                catch (error) {
                    // console.error('Error fetching all students:', error);
                }
            }
            else if (role === 'Admin') {
                try {
                    const allClasses = await api.get('/classes');

                    setClasses(allClasses.data);
                    setLoading(false);
                }
                catch (error) {
                    // console.error('Error fetching all classes:', error);
                }
            }
        };

        fetchData();
    }, [role, userId]);

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <div className="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="classNameInput" className="form-label">Class name</label>
                            <input type="text" className="form-control" id="classNameInput" onChange={handleClassNameChange} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Cancel</button>
                            <button type="button" className="btn btn-primary" data-bs-target="#exampleModalToggle2" data-bs-toggle="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }} onClick={handleCreateClassClick}>Create</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exampleModalToggle2" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handlePostClassCreation}></button>
                        </div>
                        <div className="modal-body d-flex flex-column justify-content-center align-items-center">
                            <p>Copy this code to let students join your class:</p>
                            {classCodeLoading ? (
                                <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
                                    <div className="spinner-border" role="status"
                                        style={{
                                            color: colors.accent
                                        }}
                                    >
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <h1>{classCode}</h1>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="classCodeInput" className="form-label">Class code</label>
                            <input type="text" className="form-control" id="classCodeInput" onChange={handleClassCodeInputChange} />
                            {classCodeError && (
                                <p className='mb-0' style={{ color: colors.wrong, fontSize: "12px" }}>Class does not exist.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" style={{ width: "100px", height: "40px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Cancel</button>

                            <button type="button" className="btn btn-primary" style={{ width: "100px", height: "40px", backgroundColor: colors.accent, color: colors.dark, border: "none" }} onClick={handleJoinClassClick}>
                                {buttonLoading ? (
                                    <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
                                        <div className="spinner-border spinner-border-sm" role="status"
                                            style={{
                                                color: colors.dark,
                                            }}
                                        >
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mb-0">Join</p>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Header />
            {role === 'Teacher' && (
                loading ? (
                    <NormalLoading />
                ) : (
                    <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-start gap-4'
                        style={{
                            height: "calc(100% - 100px)",
                            overflowY: "auto",
                        }}
                    >
                        <b style={{ color: colors.dark }}>Classes</b>
                        <div className="text-center w-100">
                            <div className="row row-cols-md-4 row-cols-sm-2 row-cols-1 row-gap-1">
                                {classes.map((classData, index) => {
                                    return (
                                        <Link className="p-0" to={`/class/${classData.id}`} key={index}
                                            style={{
                                                textDecoration: "none",
                                                color: colors.dark
                                            }}
                                        >
                                            <div className="col"
                                                style={{
                                                    height: "250px",
                                                    padding: "10px"
                                                }}
                                            >
                                                <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded'
                                                    style={{
                                                        border: `3px solid ${colors.dark}`,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <b>{classData.classname}</b>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                                <div className="col"
                                    style={{
                                        height: "250px",
                                        padding: "10px"
                                    }}
                                >
                                    <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded' data-bs-target="#exampleModalToggle" data-bs-toggle="modal"
                                        style={{
                                            border: `3px dashed ${colors.dark}`,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill={colors.dark} className="bi bi-plus-lg" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                        </svg>
                                        <p style={{ color: colors.dark }}>Create a new class</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            )}
            {
                role === 'Student' && (
                    loading ? (
                        <NormalLoading />
                    ) : (
                        <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-start gap-4'
                            style={{
                                height: "calc(100% - 100px)",
                                overflowY: "auto",
                            }}
                        >
                            <b style={{ color: colors.dark }}>Classes</b>
                            <div className="text-center w-100">
                                <div className="row row-cols-md-4 row-cols-sm-2 row-cols-1 row-gap-1">
                                    {classes.map((classData, index) => {
                                        return (
                                            <Link className="p-0" to={`/class/${classData.id}`} key={index}
                                                style={{
                                                    textDecoration: "none",
                                                    color: colors.dark
                                                }}
                                            >
                                                <div className="col"
                                                    style={{
                                                        height: "250px",
                                                        padding: "10px"
                                                    }}
                                                >
                                                    <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded'
                                                        style={{
                                                            border: `3px solid ${colors.dark}`,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <b>{classData.classname}</b>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                    <div className="col"
                                        style={{
                                            height: "250px",
                                            padding: "10px"
                                        }}
                                    >
                                        <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded' data-bs-toggle="modal" data-bs-target="#exampleModal"
                                            style={{
                                                border: `3px dashed ${colors.dark}`,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill={colors.dark} className="bi bi-plus-lg" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                            </svg>
                                            <p style={{ color: colors.dark }}>Join a class</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )
            }
            {role === 'Admin' && (
                loading ? (
                    <NormalLoading />
                ) : (
                    <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-start gap-4'
                        style={{
                            height: "calc(100% - 100px)",
                            overflowY: "auto",
                        }}
                    >
                        <b style={{ color: colors.dark }}>Classes</b>
                        <div className="text-center w-100">
                            <div className="row row-cols-md-4 row-cols-sm-2 row-cols-1 row-gap-1">
                                {classes && classes.map((classData, index) => {
                                    return (
                                        <Link className="p-0" to={`/class/${classData.id}`} key={index}
                                            style={{
                                                textDecoration: "none",
                                                color: colors.dark
                                            }}
                                        >
                                            <div className="col"
                                                style={{
                                                    height: "250px",
                                                    padding: "10px"
                                                }}
                                            >
                                                <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded'
                                                    style={{
                                                        border: `3px solid ${colors.dark}`,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <b>{classData.classname}</b>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    )
}

export default Homepage