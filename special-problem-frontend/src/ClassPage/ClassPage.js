import React, { useEffect, useState } from 'react'
import colors from '../colors'
import ClassPageHeader from './ClassPageHeader'
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from '../firebaseConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Radar } from 'react-chartjs-2';

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
    const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
    const [competencyDiagnosis, setCompetencyDiagnosis] = useState(null);
    const [previousDataLoading, setPreviousDataLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [
            'Basic Theory',
            'Computer Systems',
            'Technical Elements',
            'Development Techniques',
            'Project Management',
            'Service Management',
            'System Strategy',
            'Management Strategy',
            'Corporate & Legal Affairs',
        ],
        datasets: [{
            label: 'My Scoring Rate',
            data: [],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }, {
            label: 'Average Scoring Rate',
            data: [],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    });
    const options = {
        scale: {
            type: 'radialLinear',
            ticks: {
                min: 0,
                max: 100,
                beginAtZero: true
            }
        }
    };

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                const studentId = studentResponse.data.find(student => student.student_id === userData.id)?.id;

                const studentIdsInClass = [];
                const studentsInClass = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                studentsInClass.data.forEach(student => studentIdsInClass.push(student.id));

                const assessmentResponse = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${studentId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });

                const tempModelResultsArray = [];
                const tempAllModelResultsArray = [];
                const getModelResults = await axios.get('http://127.0.0.1:5000/api/model_results', {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                getModelResults.data.forEach((modelResult) => {
                    if (modelResult.student_id === studentId) {
                        tempModelResultsArray.push(modelResult);
                    }
                });
                for (const studentIdInClass of studentIdsInClass) {
                    getModelResults.data.forEach((modelResult) => {
                        if (modelResult.student_id === studentIdInClass) {
                            tempAllModelResultsArray.push(modelResult);
                        }
                    });
                }
                tempModelResultsArray.sort((a, b) => a.major_category - b.major_category);
                tempAllModelResultsArray.sort((a, b) => a.major_category - b.major_category);

                let totalClassScore = 0;
                const studentScores = [];
                for (const studentId of studentIdsInClass) {
                    try {
                        const studentAssessmentResult = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${studentId}`, {
                            headers: {
                                Authorization: `Bearer ${userObject.access_token}`
                            }
                        });
                        totalClassScore += studentAssessmentResult.data.total_score;
                        studentScores.push(studentAssessmentResult.data.total_score);
                    } catch (error) {
                        console.error("Error fetching assessment result for student ID:", studentId, error);
                        continue;
                    }
                }
                studentScores.sort((a, b) => b - a);
                const assessmentData = assessmentResponse.data;
                const scorePercentage = ((assessmentData.total_score / assessmentData.total_items) * 100).toFixed(2) + "%";
                const classAverage = (totalClassScore / studentIdsInClass.length).toFixed(2);
                const top30Index = Math.ceil(studentScores.length * 0.3);
                const top30Score = studentScores[top30Index - 1];
                const top10Index = Math.ceil(studentScores.length * 0.1);
                const top10Score = studentScores[top10Index - 1];

                const myScoringRate = tempModelResultsArray.map(result => Math.round((result.total_score / result.number_of_items) * 100));
                const averageScoringRate = [];
                let currentCategory = tempAllModelResultsArray[0].major_category;
                let score = 0;
                let items = 0;
                tempAllModelResultsArray.forEach((modelResult, index, array) => {
                    if (modelResult.major_category === currentCategory) {
                        score += modelResult.total_score;
                        items += modelResult.number_of_items;
                    } else {
                        averageScoringRate.push(Math.round((score / items) * 100));
                        currentCategory = modelResult.major_category;
                        score = modelResult.total_score;
                        items = modelResult.number_of_items;
                    }

                    if (index === array.length - 1) {
                        averageScoringRate.push(Math.round((score / items) * 100));
                    }
                });

                setComprehensiveAnalysis({
                    totalScore: assessmentData.total_score,
                    totalItems: assessmentData.total_items,
                    scorePercentage: scorePercentage,
                    classAverage: classAverage,
                    top30Score: top30Score,
                    top10Score: top10Score
                });
                setChartData(prevChartData => ({
                    ...prevChartData,
                    datasets: [{
                        ...prevChartData.datasets[0],
                        data: myScoringRate
                    }, {
                        ...prevChartData.datasets[1],
                        data: averageScoringRate
                    }]
                }));
                setCompetencyDiagnosis(tempModelResultsArray);
                setHasPreviousData(true);
                setLoading(false);
                setPreviousDataLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setPreviousDataLoading(false);
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

                const basictheory = await fetchDocuments("Technology", "Basic Theory", 15);
                const computersystems = await fetchDocuments("Technology", "Computer Systems", 15);
                const technicalelements = await fetchDocuments("Technology", "Technical Elements", 20);
                const developmenttechniques = await fetchDocuments("Technology", "Development Techniques", 5);
                const projectmanagement = await fetchDocuments("Management", "Project Management", 5);
                const servicemanagement = await fetchDocuments("Management", "Service Management", 5);
                const systemstrategy = await fetchDocuments("Strategy", "System Strategy", 5);
                const managementstrategy = await fetchDocuments("Strategy", "Management Strategy", 5);
                const corporate = await fetchDocuments("Strategy", "Corporate & Legal Affairs", 5);

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
                            studentId: studentId,
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }

    const handleContinueAssessmentClick = async () => {
        const studentResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
            headers: {
                Authorization: `Bearer ${userObject.access_token}`
            }
        });

        const studentId = studentResponse.data.find(student => student.student_id === userData.id)?.id;
        navigate(`/assessment/${assessmentId}`, {
            state: {
                studentId: studentId,
                classId: classId,
            }
        });
    }

    return (
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
            {loading ? (
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
                role === "Student" ? (
                    hasPreviousData ? (
                        <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                            style={{
                                height: "calc(100% - 100px)",
                                overflowY: "auto",
                            }}
                        >
                            <div className='w-100 d-flex flex-column justify-content-start align-items-center gap-2'>
                                <h5 className='mb-0'
                                    style={{
                                        fontFamily: "Montserrat Black",
                                        color: colors.dark
                                    }}
                                >
                                    Comprehensive Analysis
                                </h5>
                                <table className="w-75 table align-middle text-center" >
                                    <thead>
                                        <tr>
                                            <th scope="col" style={{ color: colors.dark }}>Score</th>
                                            <th scope="col" style={{ color: colors.dark }}>Percentage</th>
                                            <th scope="col" style={{ color: colors.dark }}>Class Average</th>
                                            <th scope="col" style={{ color: colors.dark }}>Top 30%</th>
                                            <th scope="col" style={{ color: colors.dark }}>Top 10%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{comprehensiveAnalysis.totalScore}/{comprehensiveAnalysis.totalItems}</td>
                                            <td>{comprehensiveAnalysis.scorePercentage}</td>
                                            <td>{comprehensiveAnalysis.classAverage}</td>
                                            <td>{comprehensiveAnalysis.top30Score}</td>
                                            <td>{comprehensiveAnalysis.top10Score}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h5 className='mb-0'
                                    style={{
                                        fontFamily: "Montserrat Black",
                                        color: colors.dark,
                                    }}
                                >
                                    Score Distribution
                                </h5>
                                <div className='w-50 d-flex justify-content-center align-items-center'>
                                    <Radar data={chartData} options={options} />
                                </div>
                                <h5 className='mb-0'
                                    style={{
                                        fontFamily: "Montserrat Black",
                                        color: colors.dark,
                                    }}
                                >
                                    Competency Diagnosis
                                </h5>
                                <table className="w-75 table text-center align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col" style={{ color: colors.dark }}>Major Category</th>
                                            <th scope="col" style={{ color: colors.dark }}>Performance Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {competencyDiagnosis.map((competencyDiagnosis, index) => (
                                            <tr key={index}>
                                                <td>
                                                    {competencyDiagnosis.major_category === 1 && "Basic Theory"}
                                                    {competencyDiagnosis.major_category === 2 && "Computer Systems"}
                                                    {competencyDiagnosis.major_category === 3 && "Technical Elements"}
                                                    {competencyDiagnosis.major_category === 4 && "Development Techniques"}
                                                    {competencyDiagnosis.major_category === 5 && "Project Management"}
                                                    {competencyDiagnosis.major_category === 6 && "Service Management"}
                                                    {competencyDiagnosis.major_category === 7 && "System Strategy"}
                                                    {competencyDiagnosis.major_category === 8 && "Management Strategy"}
                                                    {competencyDiagnosis.major_category === 9 && "Corporate & Legal Affairs"}
                                                </td>
                                                <td>
                                                    {competencyDiagnosis.major_category === 1 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Basic Theory"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Basic Theory"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Basic Theory"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 2 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Computer Systems"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Computer Systems"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Computer Systems"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 3 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Technical Elements"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Technical Elements"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Technical Elements"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 4 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Development Techniques"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Development Techniques"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Development Techniques"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 5 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Project Management"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Project Management"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Project Management"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 6 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Service Management"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Service Management"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Service Management"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 7 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in System Strategy"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in System Strategy"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in System Strategy"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 8 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Management Strategy"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Management Strategy"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Management Strategy"}
                                                        </span>
                                                    )}
                                                    {competencyDiagnosis.major_category === 9 && (
                                                        <span>
                                                            {competencyDiagnosis.cri_criteria === 'Understand' && "Subject knows the concepts required in Corporate & Legal Affairs"}
                                                            {competencyDiagnosis.cri_criteria === 'Does not understand' && "Subject does not understand the concepts required in Corporate & Legal Affairs"}
                                                            {competencyDiagnosis.cri_criteria === 'Misconception' && "Subject has misconceptions in Corporate & Legal Affairs"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                    ) : (
                        <div className='w-100 p-4 d-flex flex-column justify-content-center align-items-center gap-2'
                            style={{
                                height: "calc(100% - 100px)",
                                overflowY: "auto",
                            }}
                        >
                            {previousDataLoading ? (
                                <div className='w-100 d-flex justify-content-center align-items-center'>
                                    <div className="spinner-border" role="status"
                                        style={{
                                            color: colors.accent
                                        }}
                                    >
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <p className='mb-0'>No data found.</p>
                            )}
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
            )}

        </div >

    )
}

export default ClassPage