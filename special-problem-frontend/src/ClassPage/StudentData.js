import React from 'react'
import colors from '../colors'
import { Radar } from 'react-chartjs-2';

function StudentData({ comprehensiveAnalysis, detailedScoreAnalysis, scoreDistribution, options, competencyDiagnosis }) {
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
        </div>
    )
}

export default StudentData