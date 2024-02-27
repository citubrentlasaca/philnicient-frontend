import React from 'react'
import colors from '../colors';
import ResultsPageHeader from './ResultsPageHeader';
import 'chart.js/auto';
import { Radar } from 'react-chartjs-2';

function ResultsPage() {
    const data = {
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
            data: [65, 59, 90, 81, 56, 55, 40, 70, 90],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }, {
            label: 'Average Scoring Rate',
            data: [28, 48, 40, 19, 96, 27, 100, 50, 80],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    };

    const options = {
        scale: {
            type: 'radialLinear',
            ticks: { beginAtZero: true }
        }
    };


    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <ResultsPageHeader />
            <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'>
                <h5 className='mb-0'
                    style={{
                        fontFamily: "Montserrat Black",
                        color: colors.dark,
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
                            <td>80/80</td>
                            <td>100%</td>
                            <td>69.5</td>
                            <td>74.6</td>
                            <td>79.1</td>
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
                    <Radar data={data} options={options} />
                </div>
                <h5 className='mb-0'
                    style={{
                        fontFamily: "Montserrat Black",
                        color: colors.dark,
                    }}
                >
                    Proficiency Diagnosis
                </h5>
                <table className="w-75 table text-center align-middle" >
                    <thead>
                        <tr>
                            <th scope="col" style={{ color: colors.dark }}>Major Category</th>
                            <th scope="col" style={{ color: colors.dark }}>Proficiency Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Theory</td>
                            <td>Subject knows the concepts required in Basic Theory</td>
                        </tr>
                        <tr>
                            <td>Computer Systems</td>
                            <td>Subject knows the concepts required in Computer Systems</td>
                        </tr>
                        <tr>
                            <td>Technical Elements</td>
                            <td>Subject knows the concepts required in Technical Elements</td>
                        </tr>
                        <tr>
                            <td>Development Techniques</td>
                            <td>Subject knows the concepts required in Development Techniques</td>
                        </tr>
                        <tr>
                            <td>Project Management</td>
                            <td>Subject knows the concepts required in Project Management</td>
                        </tr>
                        <tr>
                            <td>Service Management</td>
                            <td>Subject knows the concepts required in Service Management</td>
                        </tr>
                        <tr>
                            <td>System Strategy</td>
                            <td>Subject knows the concepts required in System Strategy</td>
                        </tr>
                        <tr>
                            <td>Management Strategy</td>
                            <td>Subject knows the concepts required in Management Strategy</td>
                        </tr>
                        <tr>
                            <td>Corporate & Legal Affairs</td>
                            <td>Subject knows the concepts required in Corporate & Legal Affairs</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ResultsPage