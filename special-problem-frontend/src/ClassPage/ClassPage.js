import React, { useEffect, useState } from 'react'
import colors from '../colors'
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from '../firebaseConfig.js';
import { useNavigate, useParams } from 'react-router-dom';
import StudentData from './StudentData.js';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import NormalLoading from '../Components/NormalLoading.js';
import Header from '../Components/Header.js';
import api from '../Utilities/api.js';
import { decrypt, encrypt } from '../Utilities/utils.js';
import SmallLoading from '../Components/SmallLoading.js';

function ClassPage() {
    const navigate = useNavigate();
    const { classId } = useParams();
    const userId = sessionStorage.getItem('user_id');
    const role = sessionStorage.getItem('role');
    const [loading, setLoading] = useState(true)
    const [hasPreviousData, setHasPreviousData] = useState(false)
    const [hasActiveAssessment, setHasActiveAssessment] = useState(false)
    const [assessmentForReview, setAssessmentForReview] = useState(false)
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
    const [ongoingAssessments, setOngoingAssessments] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitAllLoading, setSubmitAllLoading] = useState(false);
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
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    useEffect(() => {
        const fetchOngoingAssessments = async () => {
            try {
                const assessments = await api.get(`/assessments/${classId}/assessments`);
                const ongoingAssessments = [];
                for (const assessment of assessments.data) {
                    try {
                        if (assessment.is_submitted === true) {
                            const student = await api.get(`/students/${assessment.student_id}`);
                            try {
                                const user = await api.get(`/users/${student.data.student_id}`);
                                ongoingAssessments.push({
                                    ...assessment,
                                    studentName: user.data.firstname + " " + user.data.middlename + " " + user.data.lastname,
                                });
                            } catch (error) {
                                // console.error("Error fetching user data:", error);
                            }
                        }
                    }
                    catch (error) {
                        // console.error("Error fetching student data:", error);
                    }
                }
                if (ongoingAssessments.length > 0) {
                    setOngoingAssessments(ongoingAssessments);
                }
            } catch (error) {
                // console.error("Error fetching ongoing assessments:", error);
            }
        }

        if (role === "Teacher") {
            fetchOngoingAssessments();
        }
    }, []);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                await api.get(`/classes/${classId}`)
            } catch (error) {
                // console.error("Class does not exist", error);
                navigate("/class-not-found");
            }
        }

        fetchClass();
    }, [classId, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (role === "Student") {
                    await api.get(`/students/${userId}/class/${classId}`);
                }
                else if (role === "Teacher") {
                    const classData = await api.get(`/classes/${classId}`)
                    if (userId !== classData.data.teacher_id) {
                        navigate("/class-not-found")
                        // console.error("Teacher does not belong to this class");
                    }
                }
            } catch (error) {
                navigate("/class-not-found")
                // console.error("Teacher/Student does not belong to this class");
            }
        }

        fetchData();
    }, [classId, navigate, role, userId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentResponse = await api.get(`/students/classes/${classId}`);
                const studentId = studentResponse.data.find(student => student.student_id === userId)?.id;

                try {
                    const assessmentResponse = await api.get(`/assessments/students/${studentId}`);
                    if (assessmentResponse.data) {
                        const response = await api.get(`/assessments/${assessmentResponse.data.assessment_id}`);
                        if (response.data.is_submitted === true) {
                            setHasActiveAssessment(false);
                            setAssessmentForReview(true);
                        }
                        else {
                            const { datetimecreated } = response.data;
                            const currentTime = new Date();
                            const assessmentTime = new Date(datetimecreated);
                            const timeDifference = Math.abs(currentTime - assessmentTime);

                            const remainingMilliseconds = 2 * 60 * 60 * 1000 + 30 * 60 * 1000 - timeDifference;
                            const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
                            const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                            const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
                            if (remainingHours <= 0 && remainingMinutes <= 0 && remainingSeconds <= 0) {
                                setHasActiveAssessment(false);
                            }
                            else {
                                setHasActiveAssessment(true);
                                setAssessmentId(assessmentResponse.data.assessment_id);
                            }
                        }
                    }

                } catch (assessmentError) {
                    setHasActiveAssessment(false);
                }
                setLoading(false);
            }
            catch (error) {
                // console.error("Error fetching students in class:", error);
            }
        };

        if (role === "Student") {
            fetchData();
        }
    }, [classId, role, userId]);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                let studentId;
                let assessmentResponseData;
                let totalClassScore = 0;
                const studentIdsInClass = [];
                const tempModelResultsArray = [];
                const tempAllModelResultsArray = [];
                const studentScores = [];

                try {
                    const studentResponse = await api.get(`/students/classes/${classId}`);
                    studentId = studentResponse.data.find(student => student.student_id === userId)?.id;
                }
                catch (error) {
                    // console.error("Error fetching student ID:", error);
                }

                try {
                    const studentsInClass = await api.get(`/students/classes/${classId}`);
                    studentsInClass.data.forEach(student => studentIdsInClass.push(student.id));
                }
                catch (error) {
                    // console.error("Error fetching students in class:", error);
                }

                try {
                    const assessmentResponse = await api.get(`/assessment_results/students/${studentId}`);
                    assessmentResponseData = assessmentResponse.data;
                }
                catch (error) {
                    // console.error("Error fetching assessment result for student ID:", studentId, error);
                }

                try {
                    const getModelResults = await api.get('/model_results');
                    for (const modelResult of getModelResults.data) {
                        if (modelResult.student_id === studentId) {
                            tempModelResultsArray.push(modelResult);
                        }
                    }
                    for (const studentIdInClass of studentIdsInClass) {
                        for (const modelResult of getModelResults.data) {
                            if (modelResult.student_id === studentIdInClass) {
                                tempAllModelResultsArray.push(modelResult);
                            }
                        }
                    }
                }
                catch (error) {
                    // console.error("Error fetching model results:", error);
                }

                tempModelResultsArray.sort((a, b) => a.major_category - b.major_category);
                tempAllModelResultsArray.sort((a, b) => a.major_category - b.major_category);

                for (const studentId of studentIdsInClass) {
                    try {
                        const studentAssessmentResult = await api.get(`/assessment_results/students/${studentId}`);
                        totalClassScore += studentAssessmentResult.data.total_score;
                        studentScores.push(studentAssessmentResult.data.total_score);
                    } catch (error) {
                        // console.error("Error fetching assessment result for student ID:", studentId, error);
                        continue;
                    }
                }

                studentScores.sort((a, b) => b - a);
                const assessmentData = assessmentResponseData;
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
                // console.error('Error fetching data:', error);
                setPreviousDataLoading(false);
            }
        };

        const fetchTeacherData = async () => {
            try {
                const studentsInClass = [];
                const studentAssessmentResults = [];

                try {
                    const studentsResponse = await api.get(`/students/classes/${classId}`);
                    studentsResponse.data.forEach(student => studentsInClass.push(student));
                }
                catch (error) {
                    // console.error("Error fetching students in class:", error);
                }

                for (const student of studentsInClass) {
                    try {
                        const assessmentResponse = await api.get(`/assessment_results/students/${student.id}`);
                        try {
                            const userResponse = await api.get(`/users/${student.student_id}`);
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
                            // console.error("Error fetching user data for student ID:", student.student_id, error);
                            continue;
                        }
                    }
                    catch (error) {
                        // console.error("Error fetching assessment result for student ID:", student, error);
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
                // console.error("Error fetching data:", error);
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
    }, [classId, role, userId]);

    const handleTakeAssessmentClick = () => {
        const fetchData = async () => {
            try {
                let studentId;
                let studentAssessmentId;
                const fetchDocuments = async (collectionName, majorCategory, count) => {
                    const q = query(collection(firestore, collectionName), where("tag", "==", majorCategory));
                    const querySnapshot = await getDocs(q);
                    const documents = querySnapshot.docs.map((doc) => {
                        return {
                            id: doc.id,
                            ...doc.data(),
                            student_answer: null,
                            student_cri: 0,
                            is_for_review: false,
                            time: 0,
                            assessment_id: null,
                        };
                    });

                    const shuffledDocuments = documents.sort(() => Math.random() - 0.5);
                    return shuffledDocuments.slice(0, count).map(({ question, figure, choices, answer, tag, student_answer, student_cri, is_for_review, time, assessment_id }) => ({
                        question,
                        figure,
                        choices,
                        answer,
                        major_category: tag,
                        student_answer,
                        student_cri,
                        is_for_review,
                        time,
                        assessment_id
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

                if (allDocuments.length > 0) {

                    try {
                        const studentResponse = await api.get(`/students/classes/${classId}`);

                        studentId = studentResponse.data.find(student => student.student_id === userId)?.id;
                    }
                    catch (error) {
                        // console.error("Error fetching students in class:", error);
                    }

                    try {
                        const studentAssessmentResponse = await api.post('/assessments', {
                            student_id: studentId,
                            is_submitted: false,
                        });
                        studentAssessmentId = studentAssessmentResponse.data.id;
                        for (const document of allDocuments) {
                            document.answer = encrypt(document.answer);
                            document.assessment_id = studentAssessmentId;
                        }

                        try {
                            await api.post('/questions', allDocuments);
                        }
                        catch (error) {
                            // console.error("Error creating question:", error);
                        }

                    }
                    catch (error) {
                        // console.error("Error creating assessment:", error);
                    }

                    navigate(`/assessment/${studentAssessmentId}`, {
                        state: {
                            classId: classId,
                            studentId: studentId,
                        }
                    });
                }
            } catch (error) {
                // console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }

    const handleContinueAssessmentClick = async () => {
        try {
            const studentResponse = await api.get(`/students/classes/${classId}`);

            const studentId = studentResponse.data.find(student => student.student_id === userId)?.id;
            navigate(`/assessment/${assessmentId}`, {
                state: {
                    studentId: studentId,
                    classId: classId,
                }
            });
        }
        catch (error) {
            // console.error("Error fetching data:", error);
        }
    }

    const handleStudentClick = async (clickedStudentId, name) => {
        try {
            let assessmentResponseData;
            let totalClassScore = 0;
            const studentIdsInClass = [];
            const tempModelResultsArray = [];
            const tempAllModelResultsArray = [];
            const studentScores = [];

            try {
                const studentsInClass = await api.get(`/students/classes/${classId}`);
                studentsInClass.data.forEach(student => studentIdsInClass.push(student.id));
            }
            catch (error) {
                // console.error("Error fetching students in class:", error);
            }

            try {
                const assessmentResponse = await api.get(`/assessment_results/students/${clickedStudentId}`);
                assessmentResponseData = assessmentResponse.data;
            }
            catch (error) {
                // console.error("Error fetching assessment result for student ID:", clickedStudentId, error);
            }

            try {
                const getModelResults = await api.get('/model_results');
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
            }
            catch (error) {
                // console.error("Error fetching model results:", error);
            }

            tempModelResultsArray.sort((a, b) => a.major_category - b.major_category);
            tempAllModelResultsArray.sort((a, b) => a.major_category - b.major_category);

            for (const studentId of studentIdsInClass) {
                try {
                    const studentAssessmentResult = await api.get(`/assessment_results/students/${studentId}`);
                    totalClassScore += studentAssessmentResult.data.total_score;
                    studentScores.push(studentAssessmentResult.data.total_score);
                } catch (error) {
                    // console.error("Error fetching assessment result for student ID:", studentId, error);
                    continue;
                }
            }
            studentScores.sort((a, b) => b - a);
            const assessmentData = assessmentResponseData;
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
            // console.error("Error fetching data:", error);
        }
    }

    const handleStudentModalClose = () => {
        setSelectedStudentLoading(true);
        setStudentDataLoading(true);
    }

    const copyClassCode = async () => {
        try {
            const classResponse = await api.get(`/classes/${classId}`);
            const textarea = document.createElement('textarea');
            textarea.value = classResponse.data.classcode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setHasCopied(true);
        } catch (error) {
            // console.error("Error fetching data:", error);
        }
    };

    const handleMajorCategoryChange = async (event) => {
        try {
            const selectedValue = parseInt(event.target.value);
            const studentIdsInClass = [];
            const tempAllModelResultsArray = [];

            try {
                const studentsInClassResponse = await api.get(`/students/classes/${classId}`);
                studentsInClassResponse.data.forEach(student => studentIdsInClass.push(student.id));
            }
            catch (error) {
                // console.error("Error fetching students in class:", error);
            }

            try {
                const getModelResultsResponse = await api.get('/model_results');

                for (const studentId of studentIdsInClass) {
                    getModelResultsResponse.data.forEach((modelResult) => {
                        if (modelResult.student_id === studentId) {
                            tempAllModelResultsArray.push(modelResult);
                        }
                    });
                }
            }
            catch (error) {
                // console.error("Error fetching model results:", error);
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
            // console.error("Error fetching data:", error);
        }
    }

    const handleSubmitAssessment = async (questions, student_id, assessment_id) => {
        try {
            setSubmitLoading(true);
            const total_items = questions.length;
            let total_score = 0;
            let basic_theory_score = 0;
            let computer_systems_score = 0;
            let technical_elements_score = 0;
            let development_techniques_score = 0;
            let project_management_score = 0;
            let service_management_score = 0;
            let system_strategy_score = 0;
            let management_strategy_score = 0;
            let corporate_legal_affairs_score = 0;
            let teacher_id;
            const categoryScores = {
                "Basic Theory": basic_theory_score,
                "Computer Systems": computer_systems_score,
                "Technical Elements": technical_elements_score,
                "Development Techniques": development_techniques_score,
                "Project Management": project_management_score,
                "Service Management": service_management_score,
                "System Strategy": system_strategy_score,
                "Management Strategy": management_strategy_score,
                "Corporate & Legal Affairs": corporate_legal_affairs_score
            };
            const questionsData = [];
            const categoryToInteger = {
                "Basic Theory": 1,
                "Computer Systems": 2,
                "Technical Elements": 3,
                "Development Techniques": 4,
                "Project Management": 5,
                "Service Management": 6,
                "System Strategy": 7,
                "Management Strategy": 8,
                "Corporate & Legal Affairs": 9
            };
            const forPrediction = [];

            for (const question of questions) {
                try {
                    const questionResponse = await api.get(`/questions/${question}`);
                    const answer = decrypt(questionResponse.data.answer);
                    if (answer === questionResponse.data.student_answer) {
                        total_score++;
                        const majorCategory = questionResponse.data.major_category;
                        categoryScores[majorCategory]++;
                    }
                    questionsData.push(questionResponse.data);
                } catch (error) {
                    // console.error('Error fetching questions:', error);
                }
            }

            try {
                const classResponse = await api.get(`/classes/${classId}`);
                teacher_id = classResponse.data.teacher_id;
            } catch (error) {
                // console.error('Error fetching teacher ID:', error);
            }

            for (const category in categoryToInteger) {
                let major_category = categoryToInteger[category];
                let number_of_items = 0;
                let total_score = 0;
                let total_time_taken = 0;
                let total_student_cri = 0;

                for (const question of questionsData) {
                    if (question.major_category === category) {
                        number_of_items++;
                        total_score += question.student_answer === decrypt(question.answer) ? 1 : 0;
                        total_time_taken += question.time;
                        total_student_cri += question.student_cri;
                    }
                }

                const average_cri = number_of_items === 0 ? 0 : parseFloat((total_student_cri / number_of_items).toFixed(1));

                forPrediction.push({
                    major_category,
                    number_of_items,
                    total_score,
                    total_time_taken,
                    average_cri
                });
            }

            try {
                await api.post('/assessment_results', {
                    total_items,
                    total_score,
                    basic_theory_score: categoryScores['Basic Theory'],
                    computer_systems_score: categoryScores['Computer Systems'],
                    technical_elements_score: categoryScores['Technical Elements'],
                    development_techniques_score: categoryScores['Development Techniques'],
                    project_management_score: categoryScores['Project Management'],
                    service_management_score: categoryScores['Service Management'],
                    system_strategy_score: categoryScores['System Strategy'],
                    management_strategy_score: categoryScores['Management Strategy'],
                    corporate_legal_affairs_score: categoryScores['Corporate & Legal Affairs'],
                    student_id,
                    teacher_id
                });
            } catch (error) {
                const assessment = await api.get(`/assessment_results/students/${student_id}`);
                const assessmentResultId = assessment.data.id;
                try {
                    await api.put(`/assessment_results/${assessmentResultId}`, {
                        total_items,
                        total_score,
                        basic_theory_score: categoryScores['Basic Theory'],
                        computer_systems_score: categoryScores['Computer Systems'],
                        technical_elements_score: categoryScores['Technical Elements'],
                        development_techniques_score: categoryScores['Development Techniques'],
                        project_management_score: categoryScores['Project Management'],
                        service_management_score: categoryScores['Service Management'],
                        system_strategy_score: categoryScores['System Strategy'],
                        management_strategy_score: categoryScores['Management Strategy'],
                        corporate_legal_affairs_score: categoryScores['Corporate & Legal Affairs'],
                        student_id,
                        teacher_id
                    });
                } catch (error) {
                    // console.error('Error updating assessment result:', error);
                }
                // console.error('Error creating assessment result:', error);
            }

            for (const prediction of forPrediction) {
                try {
                    const predictionResponse = await api.post('/model_results/predict-cri-criteria', prediction);
                    prediction.understanding_level = predictionResponse.data.understanding_level;
                    prediction.cri_criteria = predictionResponse.data.predicted_cri_criteria;
                    prediction.accuracy = predictionResponse.data.accuracy;
                    prediction.student_id = student_id;
                    prediction.teacher_id = teacher_id;
                    try {
                        const modelResult = await api.get(`/model_results/students/${student_id}/major-categories/${prediction.major_category}`);
                        const modelResultId = modelResult.data.id;
                        prediction.id = modelResultId;
                    } catch (error) {
                        // console.error('Error fetching model result:', error);
                    }
                } catch (error) {
                    // console.error('Error predicting CRI criteria:', error);
                }
            }

            try {
                await api.post('/model_results/create', forPrediction);
            } catch (error) {
                try {
                    await api.put('/model_results/update-multiple-model-results', forPrediction);
                } catch (error) {
                    // console.error('Error updating model results:', error);
                }
                // console.error('Error creating model results:', error);
            }

            try {
                await api.delete(`/assessments/${assessment_id}`);
            } catch (error) {
                // console.error('Error deleting assessment:', error);
            }

            setSubmitLoading(false);
        } catch (error) {
            // console.error('Error submitting assessment:', error);
            setSubmitLoading(false);
        }
    }

    const handleSubmitAllAssessments = async () => {
        setSubmitAllLoading(true);
        for (const assessment of ongoingAssessments) {
            handleSubmitAssessment(assessment.questions, assessment.student_id, assessment.id);
        }
    }

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <div className="modal fade" id="generateAssessmentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body d-flex flex-column justify-content-center align-items-center gap-2">
                            <p>Generating assessment...</p>
                            <NormalLoading />
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="calculateAllResultsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body d-flex flex-column justify-content-center align-items-center gap-2">
                            <p>Currently processing the results. It may take some time due to the complexity of the calculations involved. Please refrain from closing this page or refreshing it, as doing so may interrupt the processing of your assessments and delay the results further.</p>
                            <NormalLoading />
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
            <Header />
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
                                assessmentForReview ? (
                                    <button className='btn btn-primary' disabled
                                        style={{
                                            color: colors.dark,
                                            backgroundColor: colors.accent,
                                            border: "none",
                                            width: "200px"
                                        }}>
                                        Being Reviewed
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
                                )
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
                                <p>No data found.</p>
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
                                assessmentForReview ? (
                                    <button className='btn btn-primary' disabled
                                        style={{
                                            color: colors.dark,
                                            backgroundColor: colors.accent,
                                            border: "none",
                                            width: "200px"
                                        }}>
                                        Being Reviewed
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
                                )
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
                            <div className='w-50 d-flex flex-column justify-content-start align-items-center gap-2'>
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
                                ongoingAssessments && (
                                    <div className='w-50 d-flex flex-column justify-content-center align-items-center gap-2'>
                                        <h3 className='mb-0'
                                            style={{
                                                fontFamily: "Montserrat",
                                                fontWeight: "900",
                                                color: colors.dark,
                                            }}
                                        >
                                            Submitted Assessments
                                        </h3>
                                        <table className="table align-middle text-center">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ongoingAssessments.length > 0 && (
                                                    <tr>
                                                        <td></td>
                                                        <td>
                                                            <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#calculateAllResultsModal" onClick={handleSubmitAllAssessments}
                                                                style={{
                                                                    width: "200px",
                                                                    height: "40px",
                                                                    borderRadius: "10px",
                                                                    backgroundColor: colors.accent,
                                                                    borderColor: colors.accent,
                                                                    color: colors.darkest,
                                                                }}
                                                            >
                                                                {submitAllLoading ? (
                                                                    <SmallLoading />
                                                                ) : (
                                                                    <p>Calculate All Results</p>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )}
                                                {ongoingAssessments && ongoingAssessments.map((assessment, index) => (
                                                    <tr key={index}>
                                                        <td>{assessment.studentName}</td>
                                                        <td>
                                                            <button className="btn btn-primary" type="button" onClick={() => handleSubmitAssessment(assessment.questions, assessment.student_id, assessment.id)}
                                                                style={{
                                                                    width: "200px",
                                                                    height: "40px",
                                                                    borderRadius: "10px",
                                                                    backgroundColor: colors.accent,
                                                                    borderColor: colors.accent,
                                                                    color: colors.darkest,
                                                                }}
                                                            >
                                                                {submitLoading ? (
                                                                    <SmallLoading />
                                                                ) : (
                                                                    <p>Calculate Result</p>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )}
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
                                            <path fillRule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                                        </svg>
                                    ) : (
                                        <p>Copy class code</p>
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
                                    <p>No data found.</p>
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
                                                <p>Copy class code</p>
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