import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function LandingPageHeader({ questions, selectedQuestion, classId, studentId }) {
    const navigate = useNavigate()
    const userDataString = sessionStorage.getItem('userData');
    const userObject = JSON.parse(userDataString);
    const userData = userObject.user;

    const handleYesButtonClick = async () => {
        try {
            const response1 = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                headers: {
                    Authorization: `Bearer ${userObject.access_token}`
                }
            });
            const studentId = response1.data.find(student => student.student_id === userData.id)?.id;
            if (!studentId) {
                console.error('Student ID not found');
            }

            const response2 = await axios.get('http://127.0.0.1:5000/api/assessments');

            const studentAssessments = response2.data.filter(assessment => assessment.student_id === studentId);

            navigate(`/assessment/${studentAssessments[0].id}`, {
                state: {
                    tempQuestions: questions,
                    tempSelectedQuestion: selectedQuestion,
                    classId: classId,
                    studentId: studentId,
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <div className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Do you want to start the assessment?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>No</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleYesButtonClick} style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='d-flex flex-row justify-content-center align-items-center gap-4'>
                <img src={logo} alt="Logo"
                    style={{
                        height: "50px",
                        width: "50px"
                    }}
                />
            </div>
            <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop"
                style={{
                    width: "100px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                Start
            </button>
        </div>
    )
}

export default LandingPageHeader