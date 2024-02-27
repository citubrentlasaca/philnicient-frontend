import React, { useEffect, useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { useNavigate } from 'react-router-dom'

function AssessmentPageFooter({ itemNumber, totalItems, questions, timeRemaining }) {
    const [score, setScore] = useState(0);
    const [modelInputs, setModelInputs] = useState([])
    const navigate = useNavigate()

    const handleSubmit = () => {
        questions.forEach((question) => {
            if (question.answer === question.userAnswer) {
                setScore((prevScore) => prevScore + 1);
            }
        });

        const tagsToHandle = [
            'Basic Theory',
            'Computer Systems',
            'Technical Elements',
            'Development Techniques',
            'Project Management',
            'Service Management',
            'System Strategy',
            'Management Strategy',
            'Corporate & Legal Affairs',
        ];

        let modelInputsData = [];

        tagsToHandle.forEach((tag) => {
            const filteredQuestions = questions.filter((question) => question.tag === tag);
            const numberOfItems = filteredQuestions.length;

            let tagScore = 0;
            let totalTimeTaken = 0;
            let totalCRI = 0;

            filteredQuestions.forEach((question) => {
                if (question.answer === question.userAnswer) {
                    tagScore += 1;
                }

                totalTimeTaken += question.time;
                totalCRI += question.userCRI;
            });

            const averageCRI = numberOfItems > 0 ? totalCRI / numberOfItems : 0;

            modelInputsData.push({
                majorCategory: tag,
                numberOfItems,
                score: tagScore,
                totalTimeTaken,
                averageCRI,
            });
        });

        setModelInputs((prevInputs) => [...prevInputs, ...modelInputsData]);
        console.log(modelInputsData);
        navigate('/results');
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
            {itemNumber === totalItems && (
                <button className="btn btn-primary" type="button" onClick={handleSubmit}
                    style={{
                        width: "100px",
                        borderRadius: "10px",
                        backgroundColor: colors.accent,
                        borderColor: colors.accent,
                        color: colors.darkest,
                    }}
                >
                    Submit
                </button>
            )}
        </div>
    )
}

export default AssessmentPageFooter