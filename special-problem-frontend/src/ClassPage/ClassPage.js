import React, { useEffect, useState } from 'react'
import colors from '../colors'
import ClassPageHeader from './ClassPageHeader'
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from '../firebaseConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function ClassPage() {
    const userDataString = sessionStorage.getItem('userData');
    const userObject = JSON.parse(userDataString);
    const userData = userObject.user;
    const [role, setRole] = useState(userData.role)
    const [loading, setLoading] = useState(true)
    const [hasPreviousData, setHasPreviousData] = useState(false)
    const [hasActiveAssessment, setHasActiveAssessment] = useState(false)
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const navigate = useNavigate();
    const { classId } = useParams();
    const [assessmentId, setAssessmentId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });

                const studentId = studentResponse.data.find(student => student.student_id === userData.id)?.id;

                try {
                    const assessmentResponse = await axios.get(`http://127.0.0.1:5000/api/assessments/students/${studentId}`, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });
                    if (assessmentResponse.data) {
                        const response = await axios.get(`http://127.0.0.1:5000/api/assessments/${assessmentResponse.data.assessment_id}`);

                        const { datetimecreated } = response.data;
                        const currentTime = new Date();
                        const assessmentTime = new Date(datetimecreated);
                        const timeDifference = Math.abs(currentTime - assessmentTime);

                        const remainingMilliseconds = 2 * 60 * 60 * 1000 + 30 * 60 * 1000 - timeDifference;
                        const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
                        const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                        const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
                        if (remainingHours <= 0 && remainingMinutes <= 0 && remainingSeconds <= 0) {
                            await axios.delete(`http://127.0.0.1:5000/api/assessments/${assessmentResponse.data.assessment_id}`);
                        }
                        else {
                            setHasActiveAssessment(true);
                            setAssessmentId(assessmentResponse.data.assessment_id);
                        }
                    }
                } catch (assessmentError) {
                    if (assessmentError.response.status === 404) {
                        setHasActiveAssessment(false);
                    } else {
                        throw assessmentError;
                    }
                }

                setLoading(false);
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleTakeAssessmentClick = () => {
        const fetchData = async () => {
            try {
                const fetchDocuments = async (collectionName, majorCategory, count) => {
                    const q = query(collection(firestore, collectionName), where("tag", "==", majorCategory));
                    const querySnapshot = await getDocs(q);
                    const documents = querySnapshot.docs.map((doc) => {
                        return {
                            id: doc.id,
                            ...doc.data(),
                            studentAnswer: null,
                            studentCRI: 0,
                            isForReview: false,
                            time: 0,
                        };
                    });

                    const shuffledDocuments = documents.sort(() => Math.random() - 0.5);
                    return shuffledDocuments.slice(0, count).map(({ question, figure, choices, answer, tag, studentAnswer, studentCRI, isForReview, time }) => ({
                        question,
                        figure,
                        choices,
                        answer,
                        majorCategory: tag,
                        studentAnswer,
                        studentCRI,
                        isForReview,
                        time,
                    }));
                };

                const basictheory = await fetchDocuments("Technology", "Basic Theory", 1);
                const computersystems = await fetchDocuments("Technology", "Computer Systems", 1);
                const technicalelements = await fetchDocuments("Technology", "Technical Elements", 1);
                const developmenttechniques = await fetchDocuments("Technology", "Development Techniques", 1);
                const projectmanagement = await fetchDocuments("Management", "Project Management", 1);
                const servicemanagement = await fetchDocuments("Management", "Service Management", 1);
                const systemstrategy = await fetchDocuments("Strategy", "System Strategy", 1);
                const managementstrategy = await fetchDocuments("Strategy", "Management Strategy", 1);
                const corporate = await fetchDocuments("Strategy", "Corporate & Legal Affairs", 1);

                const allDocuments = [
                    ...basictheory,
                    ...computersystems,
                    ...technicalelements,
                    ...developmenttechniques,
                    ...projectmanagement,
                    ...servicemanagement,
                    ...systemstrategy,
                    ...managementstrategy,
                    ...corporate,
                ];

                setQuestions(allDocuments);
                if (allDocuments.length > 0) {
                    const firstQuestion = {
                        ...allDocuments[0],
                        itemNumber: 1,
                        studentAnswer: null,
                        studentCRI: 0,
                        isForReview: false,
                        time: 0,
                    };

                    setSelectedQuestion(firstQuestion);

                    const studentResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });

                    const studentId = studentResponse.data.find(student => student.student_id === userData.id)?.id;

                    const studentAssessmentResponse = await axios.post('http://127.0.0.1:5000/api/assessments', {
                        student_id: studentId
                    }, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });

                    const studentAssessmentId = studentAssessmentResponse.data.id;
                    const postResponses = [];
                    for (const question of allDocuments) {
                        const response = await axios.post('http://127.0.0.1:5000/api/questions', {
                            question: question.question,
                            figure: question.figure,
                            choices: question.choices,
                            answer: question.answer,
                            major_category: question.majorCategory,
                            student_answer: question.studentAnswer,
                            student_cri: question.studentCRI,
                            is_for_review: question.isForReview,
                            time: question.time,
                            assessment_id: studentAssessmentId
                        }, {
                            headers: {
                                Authorization: `Bearer ${userObject.access_token}`
                            }
                        });
                        postResponses.push({
                            id: response.data.id,
                            question: response.data.question,
                            figure: response.data.figure,
                            choices: response.data.choices,
                            answer: response.data.answer,
                            majorCategory: response.data.major_category,
                            studentAnswer: response.data.student_answer,
                            studentCRI: response.data.student_cri,
                            isForReview: response.data.is_for_review,
                            time: response.data.time,
                            assessmentId: response.data.assessment_id
                        });
                    }

                    navigate('/instructions', {
                        state: {
                            tempQuestions: postResponses,
                            tempSelectedQuestion: firstQuestion,
                            classId: classId,
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }

    const handleContinueAssessmentClick = () => {
        navigate(`/assessment/${assessmentId}`)
    }

    return (
        loading ? (
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
            <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
                <div className="modal fade" id="generateAssessmentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body d-flex flex-column justify-content-center align-items-center gap-2">
                                <p className='mb-0'>Generating assessment...</p>
                                <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
                                    <div className="spinner-border" role="status"
                                        style={{
                                            color: colors.accent
                                        }}
                                    >
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ClassPageHeader />
                {role === "Student" ? (
                    hasPreviousData ? (
                        null
                    ) : (
                        <div className='w-100 p-4 d-flex flex-column justify-content-center align-items-center gap-2'
                            style={{
                                height: "calc(100% - 100px)",
                                overflowY: "auto",
                            }}
                        >
                            <p className='mb-0'>No data found.</p>
                            {hasActiveAssessment ? (
                                <button className='btn btn-primary' onClick={handleContinueAssessmentClick}
                                    style={{
                                        color: colors.dark,
                                        backgroundColor: colors.accent,
                                        border: "none",
                                        width: "200px"
                                    }}>
                                    Continue Assessment
                                </button>
                            ) : (
                                <button className='btn btn-primary' data-bs-toggle="modal" data-bs-target="#generateAssessmentModal" onClick={handleTakeAssessmentClick}
                                    style={{
                                        color: colors.dark,
                                        backgroundColor: colors.accent,
                                        border: "none",
                                        width: "200px"
                                    }}>
                                    Take Assessment
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    null
                )
                }
            </div >
        )

    )
}

export default ClassPage