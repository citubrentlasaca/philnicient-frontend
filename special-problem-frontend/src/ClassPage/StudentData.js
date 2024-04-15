import React from 'react'
import colors from '../colors'
import { Radar } from 'react-chartjs-2';

function StudentData({ comprehensiveAnalysis, detailedScoreAnalysis, scoreDistribution, options, competencyDiagnosis }) {
    function getCategoryString(majorCategory) {
        switch (majorCategory) {
            case 1:
                return "Basic Theory";
            case 2:
                return "Computer Systems";
            case 3:
                return "Technical Elements";
            case 4:
                return "Development Techniques";
            case 5:
                return "Project Management";
            case 6:
                return "Service Management";
            case 7:
                return "System Strategy";
            case 8:
                return "Management Strategy";
            case 9:
                return "Corporate & Legal Affairs";
            default:
                return "Unknown Category";
        }
    }

    function renderCriteriaMessage(competencyDiagnosis) {
        const { cri_criteria, major_category } = competencyDiagnosis;
        const categoryString = getCategoryString(major_category);

        if (cri_criteria === 'Understand') {
            return `Subject knows the concepts required in ${categoryString}.`;
        } else if (cri_criteria === 'Does not understand') {
            return `Subject does not understand the concepts required in ${categoryString}.`;
        } else if (cri_criteria === 'Misconception') {
            return `Subject has misconceptions in ${categoryString}.`;
        } else {
            return '';
        }
    }

    function getUnderstandingFeedback(proficiencyLevel) {
        if (proficiencyLevel < 21) {
            return `Proficiency level is very low. More practice is needed to improve.`;
        } else if (proficiencyLevel < 41) {
            return `Proficiency level is low. You may need clarification on some concepts.`;
        } else if (proficiencyLevel < 61) {
            return `Proficiency level is moderate, but there are signs of guessing in responses. More focused practice is recommended.`;
        } else if (proficiencyLevel < 81) {
            return `Proficiency level is good, but some additional practice will further solidify the grasp on the concepts.`;
        } else {
            return `Congratulations! Proficiency level is excellent. Keep up the great work!`;
        }
    }

    return (
        <div className='w-100 d-flex flex-column justify-content-start align-items-center gap-4'>
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
                            <td>{comprehensiveAnalysis.totalScore}/{comprehensiveAnalysis.totalItems}</td>
                            <td>{comprehensiveAnalysis.scorePercentage}</td>
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
                            <th scope="col" style={{ color: colors.dark }}>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competencyDiagnosis.map((competencyDiagnosis, index) => (
                            <tr key={index}>
                                <td>{getCategoryString(competencyDiagnosis.major_category)}</td>
                                <td>
                                    <span>{renderCriteriaMessage(competencyDiagnosis)}</span>
                                </td>
                                <td>
                                    <span>{getUnderstandingFeedback(competencyDiagnosis.understanding_level)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentData