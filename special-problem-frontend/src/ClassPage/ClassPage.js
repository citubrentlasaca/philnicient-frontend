import React, { useEffect, useState } from 'react'
import colors from '../colors'
import ClassPageHeader from './ClassPageHeader'
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from '../firebaseConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StudentData from './StudentData.js';
import { Chart } from 'react-chartjs-2';
import NormalLoading from '../Components/NormalLoading.js';

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
    const [detailedScoreAnalysis, setDetailedScoreAnalysis] = useState(null);
    const [hasTeacherData, setHasTeacherData] = useState(false);
    const [teacherDataLoading, setTeacherDataLoading] = useState(true);
    const [teacherData, setTeacherData] = useState(null);
    const [overallLeaderboardLoading, setOverallLeaderboardLoading] = useState(true);
    const [studentDataLoading, setStudentDataLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentLoading, setSelectedStudentLoading] = useState(true);
    const [hasCopied, setHasCopied] = useState(false);
    const [scoreDistribution, setScoreDistribution] = useState({
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
            backgroundColor: 'rgba(0, 173, 181, 0.2)',
            borderColor: 'rgb(0, 173, 181)',
            pointBackgroundColor: 'rgb(0, 173, 181)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(0, 173, 181)'
        }, {
            label: 'Average Scoring Rate',
            data: [],
            fill: true,
            backgroundColor: 'rgba(57, 62, 70, 0.2)',
            borderColor: 'rgb(57, 62, 70)',
            pointBackgroundColor: 'rgb(57, 62, 70)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(57, 62, 70)'
        }]
    });
    const [competencyDistribution, setCompetencyDistribution] = useState({
        labels: [
            'Understand',
            'Does not understand',
            'Misconception',
        ],
        datasets: [{
            label: 'Student Count Per Competency',
            data: [],
            fill: true,
            backgroundColor: 'rgba(0, 173, 181, 0.2)',
            borderColor: 'rgb(0, 173, 181)',
            pointBackgroundColor: 'rgb(0, 173, 181)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(0, 173, 181)'
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
    const chartOptions = {
        type: 'bar',
        data: competencyDistribution,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
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

        if (role === "Student") {
            fetchData();
        }
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
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

                const calculatePercentage = (total_score, number_of_items) => {
                    return ((total_score / number_of_items) * 100).toFixed(2);
                };
                const tempClassAverage = {};
                tempAllModelResultsArray.forEach((result) => {
                    if (!tempClassAverage[result.major_category]) {
                        tempClassAverage[result.major_category] = { total_score: 0, count: 0 };
                    }
                    tempClassAverage[result.major_category].total_score += result.total_score;
                    tempClassAverage[result.major_category].count++;
                });
                const detailedScoreAnalysis = [];
                tempModelResultsArray.forEach((result) => {
                    const percentage = calculatePercentage(result.total_score, result.number_of_items);
                    const majorCategory = result.major_category;
                    const classAvg = tempClassAverage[majorCategory] ? (tempClassAverage[majorCategory].total_score / tempClassAverage[majorCategory].count).toFixed(2) : 0;
                    const sortedAllModelResults = tempAllModelResultsArray.filter(item => item.major_category === majorCategory).sort((a, b) => b.total_score - a.total_score);
                    const top30 = sortedAllModelResults.slice(0, Math.ceil(sortedAllModelResults.length * 0.3)).map(item => item.total_score);
                    const top10 = sortedAllModelResults.slice(0, Math.ceil(sortedAllModelResults.length * 0.1)).map(item => item.total_score);
                    detailedScoreAnalysis.push({
                        majorCategory,
                        score: result.total_score,
                        totalItems: result.number_of_items,
                        percentage,
                        classAverage: classAvg,
                        top30: top30[0],
                        top10: top10[0]
                    });
                });

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
                setDetailedScoreAnalysis(detailedScoreAnalysis);
                setScoreDistribution(prevChartData => ({
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

        const fetchTeacherData = async () => {
            try {
                const studentsInClass = [];
                const studentsResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                studentsResponse.data.forEach(student => studentsInClass.push(student));
                const studentAssessmentResults = [];
                for (const student of studentsInClass) {
                    try {
                        const assessmentResponse = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${student.id}`, {
                            headers: {
                                Authorization: `Bearer ${userObject.access_token}`
                            }
                        });
                        const userResponse = await axios.get(`http://127.0.0.1:5000/api/users/${student.student_id}`);
                        const studentName = userResponse.data.firstname + " " + userResponse.data.middlename + " " + userResponse.data.lastname;
                        studentAssessmentResults.push(
                            {
                                studentName: studentName,
                                studentId: student.id,
                                totalScore: assessmentResponse.data.total_score,
                            }
                        );
                    }
                    catch (error) {
                        console.error("Error fetching assessment result for student ID:", student, error);
                        continue;
                    }
                }
                studentAssessmentResults.sort((a, b) => b.totalScore - a.totalScore);

                setTeacherData(studentAssessmentResults);
                setOverallLeaderboardLoading(false);
                setHasTeacherData(true);
                setTeacherDataLoading(false);
                setLoading(false);
            }
            catch (error) {
                console.error("Error fetching data:", error);
                setTeacherDataLoading(false);
                setHasTeacherData(false);
                setLoading(false);
            }
        }

        if (role === "Student") {
            fetchStudentData();
        }
        else {
            fetchTeacherData();
        }
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

                const basictheory = await fetchDocuments("Technology", "Basic Theory", 7);
                const computersystems = await fetchDocuments("Technology", "Computer Systems", 7);
                const technicalelements = await fetchDocuments("Technology", "Technical Elements", 7);
                const developmenttechniques = await fetchDocuments("Technology", "Development Techniques", 7);
                const projectmanagement = await fetchDocuments("Management", "Project Management", 7);
                const servicemanagement = await fetchDocuments("Management", "Service Management", 7);
                const systemstrategy = await fetchDocuments("Strategy", "System Strategy", 7);
                const managementstrategy = await fetchDocuments("Strategy", "Management Strategy", 7);
                const corporate = await fetchDocuments("Strategy", "Corporate & Legal Affairs", 7);

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

    const handleStudentClick = async (clickedStudentId, name) => {
        try {
            const studentIdsInClass = [];
            const studentsInClass = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                headers: {
                    Authorization: `Bearer ${userObject.access_token}`
                }
            });
            studentsInClass.data.forEach(student => studentIdsInClass.push(student.id));

            const assessmentResponse = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${clickedStudentId}`, {
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
                if (modelResult.student_id === clickedStudentId) {
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

            const calculatePercentage = (total_score, number_of_items) => {
                return ((total_score / number_of_items) * 100).toFixed(2);
            };
            const tempClassAverage = {};
            tempAllModelResultsArray.forEach((result) => {
                if (!tempClassAverage[result.major_category]) {
                    tempClassAverage[result.major_category] = { total_score: 0, count: 0 };
                }
                tempClassAverage[result.major_category].total_score += result.total_score;
                tempClassAverage[result.major_category].count++;
            });
            const detailedScoreAnalysis = [];
            tempModelResultsArray.forEach((result) => {
                const percentage = calculatePercentage(result.total_score, result.number_of_items);
                const majorCategory = result.major_category;
                const classAvg = tempClassAverage[majorCategory] ? (tempClassAverage[majorCategory].total_score / tempClassAverage[majorCategory].count).toFixed(2) : 0;
                const sortedAllModelResults = tempAllModelResultsArray.filter(item => item.major_category === majorCategory).sort((a, b) => b.total_score - a.total_score);
                const top30 = sortedAllModelResults.slice(0, Math.ceil(sortedAllModelResults.length * 0.3)).map(item => item.total_score);
                const top10 = sortedAllModelResults.slice(0, Math.ceil(sortedAllModelResults.length * 0.1)).map(item => item.total_score);
                detailedScoreAnalysis.push({
                    majorCategory,
                    score: result.total_score,
                    totalItems: result.number_of_items,
                    percentage,
                    classAverage: classAvg,
                    top30: top30[0],
                    top10: top10[0]
                });
            });

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
            setDetailedScoreAnalysis(detailedScoreAnalysis);
            setScoreDistribution(prevChartData => ({
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
            setSelectedStudent(name);
            setSelectedStudentLoading(false);
            setStudentDataLoading(false);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const handleStudentModalClose = () => {
        setSelectedStudentLoading(true);
        setStudentDataLoading(true);
    }

    const copyClassCode = async () => {
        try {
            const classResponse = await axios.get(`http://127.0.0.1:5000/api/classes/${classId}`);
            const textarea = document.createElement('textarea');
            textarea.value = classResponse.data.classcode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setHasCopied(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleMajorCategoryChange = async (event) => {
        try {
            const selectedValue = parseInt(event.target.value);
            const studentIdsInClass = [];
            const tempAllModelResultsArray = [];

            const studentsInClassResponse = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                headers: {
                    Authorization: `Bearer ${userObject.access_token}`
                }
            });
            studentsInClassResponse.data.forEach(student => studentIdsInClass.push(student.id));

            const getModelResultsResponse = await axios.get('http://127.0.0.1:5000/api/model_results', {
                headers: {
                    Authorization: `Bearer ${userObject.access_token}`
                }
            });

            for (const studentId of studentIdsInClass) {
                getModelResultsResponse.data.forEach((modelResult) => {
                    if (modelResult.student_id === studentId) {
                        tempAllModelResultsArray.push(modelResult);
                    }
                });
            }

            tempAllModelResultsArray.sort((a, b) => a.major_category - b.major_category);

            let understandCount = 0;
            let notUnderstandCount = 0;
            let misconceptionCount = 0;

            tempAllModelResultsArray.forEach(result => {
                if (result.major_category === selectedValue) {
                    if (result.cri_criteria === "Understand") {
                        understandCount++;
                    } else if (result.cri_criteria === "Does not understand") {
                        notUnderstandCount++;
                    } else if (result.cri_criteria === "Misconception") {
                        misconceptionCount++;
                    }
                }
            });

            const countsArray = [understandCount, notUnderstandCount, misconceptionCount];

            setCompetencyDistribution(prevChartData => ({
                ...prevChartData,
                datasets: [{
                    ...prevChartData.datasets[0],
                    data: countsArray
                }]
            }));
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
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
            <div className="modal fade" id="studentDataModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">
                                {selectedStudentLoading ? null : selectedStudent}
                            </h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleStudentModalClose}></button>
                        </div>
                        <div className="modal-body">
                            {studentDataLoading ? (
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
                                <StudentData comprehensiveAnalysis={comprehensiveAnalysis} detailedScoreAnalysis={detailedScoreAnalysis} scoreDistribution={scoreDistribution} options={options} competencyDiagnosis={competencyDiagnosis} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ClassPageHeader />
            {loading ? (
                <NormalLoading />
            ) : (
                role === "Student" ? (
                    hasPreviousData ? (
                        <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                            style={{
                                height: "calc(100% - 100px)",
                                overflowY: "auto",
                            }}
                        >
                            <StudentData comprehensiveAnalysis={comprehensiveAnalysis} detailedScoreAnalysis={detailedScoreAnalysis} scoreDistribution={scoreDistribution} options={options} competencyDiagnosis={competencyDiagnosis} />
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
                    hasTeacherData ? (
                        <div className='w-100 h-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                            style={{
                                overflowY: "auto",
                            }}
                        >
                            <div className='w-50 h-100 d-flex flex-column justify-content-start align-items-center gap-2'>
                                <h3 className='mb-0'
                                    style={{
                                        fontFamily: "Montserrat",
                                        fontWeight: "900",
                                        color: colors.dark
                                    }}
                                >
                                    Leaderboard
                                </h3>
                                <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4 rounded'
                                    style={{
                                        maxHeight: "100%",
                                        overflowY: "auto",
                                        backgroundColor: colors.darkest
                                    }}
                                >
                                    {overallLeaderboardLoading ? (
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
                                        teacherData.map((student, index) => (
                                            <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-4' key={index}>
                                                <h1 className='mb-0 text-center'
                                                    style={{
                                                        fontFamily: "Montserrat",
                                                        fontWeight: "900",
                                                        color: colors.accent,
                                                        width: "10%"
                                                    }}
                                                >
                                                    {index + 1}
                                                </h1>
                                                <div className='p-4 d-flex flex-row justify-content-between align-items-center rounded' data-bs-toggle="modal" data-bs-target="#studentDataModal" onClick={() => handleStudentClick(student.studentId, student.studentName)}
                                                    style={{
                                                        backgroundColor: colors.accent,
                                                        width: "90%",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <b>{student.studentName}</b>
                                                    <b>{student.totalScore}</b>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className='w-50 d-flex flex-column justify-content-center align-items-center gap-2'>
                                <h3 className='mb-0'
                                    style={{
                                        fontFamily: "Montserrat",
                                        fontWeight: "900",
                                        color: colors.dark,
                                    }}
                                >
                                    Competency Distribution
                                </h3>
                                <select className="form-select" defaultValue="Placeholder" onChange={handleMajorCategoryChange}>
                                    <option value="Placeholder" disabled>Select a major category</option>
                                    <option value="1">Basic Theory</option>
                                    <option value="2">Computer Systems</option>
                                    <option value="3">Technical Elements</option>
                                    <option value="4">Development Techniques</option>
                                    <option value="5">Project Management</option>
                                    <option value="6">Service Management</option>
                                    <option value="7">System Strategy</option>
                                    <option value="8">Management Strategy</option>
                                    <option value="9">Corporate & Legal Affairs</option>
                                </select>
                                <div className='w-100 d-flex justify-content-center align-items-center'>
                                    <Chart type='bar' data={competencyDistribution} options={chartOptions} />
                                </div>
                            </div>
                            {role === "Teacher" && (
                                <button className='btn btn-primary' onClick={copyClassCode}
                                    style={{
                                        color: colors.dark,
                                        backgroundColor: colors.accent,
                                        border: "none",
                                        height: "40px",
                                        width: "200px"
                                    }}>
                                    {hasCopied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-clipboard-check" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                                        </svg>
                                    ) : (
                                        <p className='mb-0'>Copy class code</p>
                                    )}
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
                            {teacherDataLoading ? (
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
                                <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                                    <p className='mb-0'>No data found.</p>
                                    {role === "Teacher" && (
                                        <button className='btn btn-primary' onClick={copyClassCode}
                                            style={{
                                                color: colors.dark,
                                                backgroundColor: colors.accent,
                                                border: "none",
                                                height: "40px",
                                                width: "200px"
                                            }}>
                                            {hasCopied ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={colors.dark} className="bi bi-clipboard-check" viewBox="0 0 16 16">
                                                    <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                                                </svg>
                                            ) : (
                                                <p className='mb-0'>Copy class code</p>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                )
            )}
        </div >
    )
}

export default ClassPage