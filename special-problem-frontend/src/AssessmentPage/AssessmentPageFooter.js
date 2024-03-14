import React, { useEffect, useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

function AssessmentPageFooter({ itemNumber, totalItems, questions, timeRemaining, assessmentId, classId, studentId }) {
    const [score, setScore] = useState(0);
    const [modelInputs, setModelInputs] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        setLoading(true);
        const categoryToNumber = {
            'Basic Theory': 1,
            'Computer Systems': 2,
            'Technical Elements': 3,
            'Development Techniques': 4,
            'Project Management': 5,
            'Service Management': 6,
            'System Strategy': 7,
            'Management Strategy': 8,
            'Corporate & Legal Affairs': 9,
        };

        questions.forEach((question) => {
            if (question.answer === question.studentAnswer) {
                setScore((prevScore) => prevScore + 1);
            }
        });

        const tagsToHandle = Object.keys(categoryToNumber);

        let modelInputsData = [];

        tagsToHandle.forEach((majorCategory) => {
            const filteredQuestions = questions.filter((question) => question.majorCategory === majorCategory);
            const numberOfItems = filteredQuestions.length;

            let tagScore = 0;
            let totalTimeTaken = 0;
            let totalCRI = 0;

            filteredQuestions.forEach((question) => {
                if (question.answer === question.studentAnswer) {
                    tagScore += 1;
                }

                totalTimeTaken += question.time;
                totalCRI += question.studentCRI;
            });

            const averageCRI = numberOfItems > 0 ? totalCRI / numberOfItems : 0;

            modelInputsData.push({
                majorCategory: categoryToNumber[majorCategory],
                numberOfItems,
                score: tagScore,
                totalTimeTaken,
                averageCRI,
            });
        });

        setModelInputs((prevInputs) => [...prevInputs, ...modelInputsData]);
        await axios.delete(`http://127.0.0.1:5000/api/assessments/${assessmentId}`);
        navigate(`/results`, {
            state: {
                modelInputsData: modelInputsData,
                studentId: studentId,
                totalItems: totalItems,
                classId: classId
            }
        });
    };

    useEffect(() => {
        if (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
            handleSubmit();
        }
    }, [timeRemaining]);

    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,
            }}
        >
            <h5 className='mb-0'
                style={{
                    color: colors.accent,
                    fontFamily: "Montserrat Black",
                }}
            >
                {itemNumber} out of {totalItems}
            </h5>
            <button className="btn btn-primary" type="button" onClick={handleSubmit}
                style={{
                    width: "100px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                {loading ? (
                    <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
                        <div className="spinner-border spinner-border-sm" role="status"
                            style={{
                                color: colors.dark,
                            }}
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <p className="mb-0">Submit</p>
                )}
            </button>
        </div>
    )
}

export default AssessmentPageFooter