import React, { useEffect, useState } from 'react'
import colors from '../colors';
import ResultsPageHeader from './ResultsPageHeader';
import 'chart.js/auto';
import { Radar } from 'react-chartjs-2';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import NormalLoading from '../Components/NormalLoading';

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
    const [detailedScoreAnalysis, setDetailedScoreAnalysis] = useState(null);
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

            const tempModelResultsArray = [];
            const tempAllModelResultsArray = [];
            try {
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

                for (const model of tempModelResultsArray) {
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

            const tempStudentAssessmentResultArray = [];
            for (const studentId of studentIdsInClass) {
                try {
                    const studentAssessmentResult = await axios.get(`http://127.0.0.1:5000/api/assessment_results/students/${studentId}`, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });
                    tempStudentAssessmentResultArray.push(studentAssessmentResult.data);
                } catch (error) {
                    console.error("Error fetching assessment result for student ID:", studentId, error);
                    continue;
                }
            }

            try {
                await axios.post('http://127.0.0.1:5000/api/assessment_results', {
                    total_score: totalScore,
                    total_items: totalItems,
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
                    total_items: totalItems,
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

            setResults(updatedResultsData);
            setComprehensiveAnalysis({ totalScore, percentageOfScore, classAverage, top30Score, top10Score });
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
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <ResultsPageHeader />
            {loading ? (
                <NormalLoading />
            ) : (
                <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                    style={{
                        height: "calc(100% - 100px)",
                        overflowY: "auto",
                    }}
                >
                    <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                        <h3 className='mb-0'
                            style={{
                                fontFamily: "Montserrat",
                                fontWeight: "900",
                                color: colors.dark
                            }}
                        >
                            Comprehensive Analysis
                        </h3>
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
                                    <td>{comprehensiveAnalysis.totalScore}/{totalItems}</td>
                                    <td>{comprehensiveAnalysis.percentageOfScore}</td>
                                    <td>{comprehensiveAnalysis.classAverage}</td>
                                    <td>{comprehensiveAnalysis.top30Score}</td>
                                    <td>{comprehensiveAnalysis.top10Score}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                        <h3 className='mb-0'
                            style={{
                                fontFamily: "Montserrat",
                                fontWeight: "900",
                                color: colors.dark
                            }}
                        >
                            Detailed Score Analysis
                        </h3>
                        <table className="w-75 table align-middle text-center" >
                            <thead>
                                <tr>
                                    <th scope="col" style={{ color: colors.dark }}>Major Category</th>
                                    <th scope="col" style={{ color: colors.dark }}>My Score / Perfect Score</th>
                                    <th scope="col" style={{ color: colors.dark }}>Percentage</th>
                                    <th scope="col" style={{ color: colors.dark }}>Class Average</th>
                                    <th scope="col" style={{ color: colors.dark }}>Top 30%</th>
                                    <th scope="col" style={{ color: colors.dark }}>Top 10%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailedScoreAnalysis.map((detailedScoreAnalysis, index) => (
                                    <tr key={index}>
                                        <td>
                                            {detailedScoreAnalysis.majorCategory === 1 && "Basic Theory"}
                                            {detailedScoreAnalysis.majorCategory === 2 && "Computer Systems"}
                                            {detailedScoreAnalysis.majorCategory === 3 && "Technical Elements"}
                                            {detailedScoreAnalysis.majorCategory === 4 && "Development Techniques"}
                                            {detailedScoreAnalysis.majorCategory === 5 && "Project Management"}
                                            {detailedScoreAnalysis.majorCategory === 6 && "Service Management"}
                                            {detailedScoreAnalysis.majorCategory === 7 && "System Strategy"}
                                            {detailedScoreAnalysis.majorCategory === 8 && "Management Strategy"}
                                            {detailedScoreAnalysis.majorCategory === 9 && "Corporate & Legal Affairs"}
                                        </td>
                                        <td>{detailedScoreAnalysis.score}/{detailedScoreAnalysis.totalItems}</td>
                                        <td>{detailedScoreAnalysis.percentage}%</td>
                                        <td>{detailedScoreAnalysis.classAverage}</td>
                                        <td>{detailedScoreAnalysis.top30}</td>
                                        <td>{detailedScoreAnalysis.top10}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                        <h3 className='mb-0'
                            style={{
                                fontFamily: "Montserrat",
                                fontWeight: "900",
                                color: colors.dark,
                            }}
                        >
                            Score Distribution
                        </h3>
                        <div className='w-50 d-flex justify-content-center align-items-center'>
                            <Radar data={scoreDistribution} options={options} />
                        </div>
                    </div>
                    <div className='w-100 d-flex flex-column justify-content-center align-items-center gap-2'>
                        <h3 className='mb-0'
                            style={{
                                fontFamily: "Montserrat",
                                fontWeight: "900",
                                color: colors.dark,
                            }}
                        >
                            Competency Diagnosis
                        </h3>
                        <table className="w-75 table text-center align-middle">
                            <thead>
                                <tr>
                                    <th scope="col" style={{ color: colors.dark }}>Major Category</th>
                                    <th scope="col" style={{ color: colors.dark }}>Proficiency Level</th>
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
                    </div>
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