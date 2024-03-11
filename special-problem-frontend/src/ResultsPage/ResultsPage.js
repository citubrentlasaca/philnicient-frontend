import React, { useEffect, useState } from 'react'
import colors from '../colors';
import ResultsPageHeader from './ResultsPageHeader';
import 'chart.js/auto';
import { Radar } from 'react-chartjs-2';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function ResultsPage() {
    const userDataString = sessionStorage.getItem('userData');
    const userObject = JSON.parse(userDataString);
    const userData = userObject.user;
    const location = useLocation();
    const { modelInputsData, studentId, totalItems, classId } = location.state || {};
    const [resultsData, setResultsData] = useState(modelInputsData);
    const [results, setResults] = useState(null);
    const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
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
            ticks: { beginAtZero: true }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const updatedResultsData = await Promise.all(resultsData.map(async (result) => {
                const predict = await axios.post('http://127.0.0.1:5000/api/model_results/predict-cri-criteria', {
                    major_category: result.majorCategory,
                    number_of_items: result.numberOfItems,
                    total_score: result.score,
                    total_time_taken: result.totalTimeTaken,
                    average_cri: result.averageCRI
                });

                return { ...result, predictedCRICriteria: predict.data.predicted_cri_criteria, accuracy: predict.data.accuracy };
            }));

            const postRequests = updatedResultsData.map(async (result) => {
                try {
                    await axios.post('http://127.0.0.1:5000/api/model_results', {
                        major_category: result.majorCategory,
                        number_of_items: result.numberOfItems,
                        total_score: result.score,
                        total_time_taken: result.totalTimeTaken,
                        average_cri: result.averageCRI,
                        cri_criteria: result.predictedCRICriteria,
                        student_id: studentId,
                    }, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });
                } catch (error) {
                    console.error('An error occurred while posting data:', error);
                }
            });

            await Promise.all(postRequests);

            const studentIdsInClass = [];
            const studentsInClass = await axios.get(`http://127.0.0.1:5000/api/students/classes/${classId}`, {
                headers: {
                    Authorization: `Bearer ${userObject.access_token}`
                }
            });
            studentsInClass.data.forEach(student => studentIdsInClass.push(student.id));

            const tempAllModelResultsArray = [];
            try {
                const tempArray = [];
                const getModelResults = await axios.get('http://127.0.0.1:5000/api/model_results', {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });

                getModelResults.data.forEach((modelResult) => {
                    if (modelResult.student_id === studentId) {
                        tempArray.push(modelResult);
                    }
                });
                for (const studentIdInClass of studentIdsInClass) {
                    getModelResults.data.forEach((modelResult) => {
                        if (modelResult.student_id === studentIdInClass) {
                            tempAllModelResultsArray.push(modelResult);
                        }
                    });
                }
                tempAllModelResultsArray.sort((a, b) => a.major_category - b.major_category);

                for (const model of tempArray) {
                    try {
                        const updatedResult = updatedResultsData.find(result => result.majorCategory === model.major_category);
                        if (!updatedResult) {
                            console.error('No matching result found for major category:', model.major_category);
                            continue;
                        }

                        await axios.put(`http://127.0.0.1:5000/api/model_results/${model.id}`, {
                            major_category: updatedResult.majorCategory,
                            number_of_items: updatedResult.numberOfItems,
                            total_score: updatedResult.score,
                            total_time_taken: updatedResult.totalTimeTaken,
                            average_cri: updatedResult.averageCRI,
                            cri_criteria: updatedResult.predictedCRICriteria,
                            student_id: studentId,
                        }, {
                            headers: {
                                Authorization: `Bearer ${userObject.access_token}`
                            }
                        });
                    } catch (error) {
                        console.error('An error occurred while putting data:', error);
                    }
                }
            } catch (error) {
                console.error('An error occurred while getting model results:', error);
            }

            const totalScore = updatedResultsData.reduce((acc, result) => acc + result.score, 0);
            const percentageOfScore = ((totalScore / totalItems) * 100).toFixed(2) + "%";

            const tempArray = [];
            for (const studentId of studentIdsInClass) {
                try {
                    const studentAssessmentResult = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${studentId}`, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });
                    tempArray.push(studentAssessmentResult.data);
                } catch (error) {
                    console.error("Error fetching assessment result for student ID:", studentId, error);
                    continue;
                }
            }

            try {
                await axios.post('http://127.0.0.1:5000/api/assessment_results', {
                    total_score: totalScore,
                    total_items: updatedResultsData.length,
                    basic_theory_score: updatedResultsData[0].score,
                    computer_systems_score: updatedResultsData[1].score,
                    technical_elements_score: updatedResultsData[2].score,
                    development_techniques_score: updatedResultsData[3].score,
                    project_management_score: updatedResultsData[4].score,
                    service_management_score: updatedResultsData[5].score,
                    system_strategy_score: updatedResultsData[6].score,
                    management_strategy_score: updatedResultsData[7].score,
                    corporate_legal_affairs_score: updatedResultsData[8].score,
                    student_id: studentId,
                }, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
            } catch (error) {
                const studentAssessmentResult = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${studentId}`, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                await axios.put(`http://127.0.0.1:5000/api/assessment_results/${studentAssessmentResult.data.id}`, {
                    total_score: totalScore,
                    total_items: updatedResultsData.length,
                    basic_theory_score: updatedResultsData[0].score,
                    computer_systems_score: updatedResultsData[1].score,
                    technical_elements_score: updatedResultsData[2].score,
                    development_techniques_score: updatedResultsData[3].score,
                    project_management_score: updatedResultsData[4].score,
                    service_management_score: updatedResultsData[5].score,
                    system_strategy_score: updatedResultsData[6].score,
                    management_strategy_score: updatedResultsData[7].score,
                    corporate_legal_affairs_score: updatedResultsData[8].score,
                    student_id: studentId,
                }, {
                    headers: {
                        Authorization: `Bearer ${userObject.access_token}`
                    }
                });
                console.error("Error posting assessment results:", error);
            }

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
            const classAverage = (totalClassScore / studentIdsInClass.length).toFixed(2);
            const top30Index = Math.ceil(studentScores.length * 0.3);
            const top30Score = studentScores[top30Index - 1];
            const top10Index = Math.ceil(studentScores.length * 0.1);
            const top10Score = studentScores[top10Index - 1];

            const myScoringRate = resultsData.map(result => Math.round((result.score / result.numberOfItems) * 100));
            const averageScoringRate = [];
            let currentCategory = tempAllModelResultsArray[0].major_category;
            let score = 0;
            let itemCount = 0;
            tempAllModelResultsArray.forEach((modelResult, index, array) => {
                if (modelResult.major_category === currentCategory) {
                    score += modelResult.total_score;
                    itemCount++;
                    if (index === array.length - 1) {
                        averageScoringRate.push((score / itemCount) * 100);
                    }
                } else {
                    averageScoringRate.push((score / itemCount) * 100);
                    currentCategory = modelResult.major_category;
                    score = modelResult.total_score;
                    itemCount = 1;
                }
            });

            setResults(updatedResultsData);
            setComprehensiveAnalysis({ totalScore, percentageOfScore, classAverage, top30Score, top10Score });
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
            setLoading(false);
        };

        fetchData();
    }, [modelInputsData]);

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <ResultsPageHeader />
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
                <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                    style={{
                        height: "calc(100% - 100px)",
                        overflowY: "auto",
                    }}
                >
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
                                <td>{comprehensiveAnalysis.totalScore}/{results.length}</td>
                                <td>{comprehensiveAnalysis.percentageOfScore}</td>
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
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td>
                                        {result.majorCategory === 1 && "Basic Theory"}
                                        {result.majorCategory === 2 && "Computer Systems"}
                                        {result.majorCategory === 3 && "Technical Elements"}
                                        {result.majorCategory === 4 && "Development Techniques"}
                                        {result.majorCategory === 5 && "Project Management"}
                                        {result.majorCategory === 6 && "Service Management"}
                                        {result.majorCategory === 7 && "System Strategy"}
                                        {result.majorCategory === 8 && "Management Strategy"}
                                        {result.majorCategory === 9 && "Corporate & Legal Affairs"}
                                    </td>
                                    <td>
                                        {result.majorCategory === 1 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Basic Theory"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Basic Theory"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Basic Theory"}
                                            </span>
                                        )}
                                        {result.majorCategory === 2 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Computer Systems"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Computer Systems"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Computer Systems"}
                                            </span>
                                        )}
                                        {result.majorCategory === 3 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Technical Elements"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Technical Elements"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Technical Elements"}
                                            </span>
                                        )}
                                        {result.majorCategory === 4 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Development Techniques"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Development Techniques"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Development Techniques"}
                                            </span>
                                        )}
                                        {result.majorCategory === 5 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Project Management"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Project Management"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Project Management"}
                                            </span>
                                        )}
                                        {result.majorCategory === 6 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Service Management"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Service Management"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Service Management"}
                                            </span>
                                        )}
                                        {result.majorCategory === 7 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in System Strategy"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in System Strategy"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in System Strategy"}
                                            </span>
                                        )}
                                        {result.majorCategory === 8 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Management Strategy"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Management Strategy"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Management Strategy"}
                                            </span>
                                        )}
                                        {result.majorCategory === 9 && (
                                            <span>
                                                {result.predictedCRICriteria === 'Understand' && "Subject knows the concepts required in Corporate & Legal Affairs"}
                                                {result.predictedCRICriteria === 'Does not understand' && "Subject does not understand the concepts required in Corporate & Legal Affairs"}
                                                {result.predictedCRICriteria === 'Misconception' && "Subject has misconceptions in Corporate & Legal Affairs"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Link to='/'>
                        <button className='btn btn-primary'
                            style={{
                                color: colors.dark,
                                backgroundColor: colors.accent,
                                border: "none",
                                width: "200px"
                            }}>
                            Go back to Home
                        </button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ResultsPage