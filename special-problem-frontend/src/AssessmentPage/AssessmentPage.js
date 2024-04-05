import React, { useEffect, useState } from 'react'
import colors from '../colors';
import AssessmentPageLayout from './AssessmentPageLayout';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

function AssessmentPage() {
    const location = useLocation();
    const { tempQuestions, tempSelectedQuestion, classId, studentId } = location.state || {};
    const [questions, setQuestions] = useState(tempQuestions);
    const [selectedQuestion, setSelectedQuestion] = useState(tempSelectedQuestion);
    const [certaintyIndex, setCertaintyIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const { assessmentId } = useParams();
    const userDataString = sessionStorage.getItem('userData');
    const userObject = JSON.parse(userDataString);
    const userData = userObject.user;

    useEffect(() => {
        if (questions && selectedQuestion) {
            setLoading(false);
        } else {
            axios.get(`http://127.0.0.1:5000/api/assessments/${assessmentId}`)
                .then(response => {
                    const questionsArray = response.data.questions;
                    const promises = questionsArray.map(assessment =>
                        axios.get(`http://127.0.0.1:5000/api/questions/${assessment}`)
                    );

                    Promise.all(promises)
                        .then(responses => {
                            const formattedQuestions = responses.map(response => {
                                const {
                                    question,
                                    figure,
                                    choices,
                                    answer,
                                    major_category: majorCategory,
                                    student_answer: studentAnswer,
                                    student_cri: studentCRI,
                                    is_for_review: isForReview,
                                    time
                                } = response.data;

                                return {
                                    question,
                                    figure,
                                    choices,
                                    answer,
                                    majorCategory,
                                    studentAnswer,
                                    studentCRI,
                                    isForReview,
                                    time
                                };
                            });

                            setQuestions(formattedQuestions);
                            setSelectedQuestion(formattedQuestions[0]);
                            setLoading(false);
                        })
                        .catch(error => {
                            console.error('Error fetching assessments:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching student assessments:', error);
                });
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                for (const question of questions) {
                    await axios.put(`http://127.0.0.1:5000/api/questions/${question.id}`, {
                        question: question.question,
                        figure: question.figure,
                        choices: question.choices,
                        answer: question.answer,
                        major_category: question.majorCategory,
                        student_answer: question.studentAnswer,
                        student_cri: question.studentCRI,
                        is_for_review: question.isForReview,
                        time: question.time,
                        assessment_id: question.assessmentId
                    }, {
                        headers: {
                            Authorization: `Bearer ${userObject.access_token}`
                        }
                    });
                }
            } catch (error) {
                console.error('Error updating questions:', error);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const getCertaintyLabel = (studentCRI) => {
        if (studentCRI === 0) {
            return "Certainty of Response Index: Totally Guessed Answer";
        }
        else if (studentCRI === 1) {
            return "Certainty of Response Index: Almost Guess";
        }
        else if (studentCRI === 2) {
            return "Certainty of Response Index: Not Sure";
        }
        else if (studentCRI === 3) {
            return "Certainty of Response Index: Sure";
        }
        else if (studentCRI === 4) {
            return "Certainty of Response Index: Almost Certain";
        }
        else if (studentCRI === 5) {
            return "Certainty of Response Index: Certain";
        }
    }

    const handleQuestionClick = (question, index) => {
        setSelectedQuestion({
            question: question.question,
            figure: question.figure,
            choices: question.choices,
            answer: question.answer,
            majorCategory: question.majorCategory,
            itemNumber: index + 1,
            studentAnswer: question.studentAnswer,
            studentCRI: question.studentCRI,
            isForReview: question.isForReview,
            time: question.time,
        });
    };

    const handleRadioChange = (event) => {
        const selectedChoice = event.target.value;

        setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            const selectedQuestionIndex = updatedQuestions.findIndex(question => (
                question.question === ''
                    ? question.figure === selectedQuestion.figure
                    : question.question === selectedQuestion.question
            ));

            if (selectedQuestionIndex !== -1) {
                updatedQuestions[selectedQuestionIndex].studentAnswer = selectedChoice;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            studentAnswer: selectedChoice,
        }));
    };

    const handleCheckboxChange = () => {
        const updatedQuestions = [...questions];
        const index = updatedQuestions.findIndex(
            (question) =>
                (question.question === selectedQuestion.question) ||
                (question.question === null && selectedQuestion.question === null && question.figure === selectedQuestion.figure)
        );

        if (index !== -1) {
            updatedQuestions[index].isForReview = !updatedQuestions[index].isForReview;

            setSelectedQuestion((prevSelectedQuestion) => ({
                ...prevSelectedQuestion,
                isForReview: !prevSelectedQuestion.isForReview,
            }));

            setQuestions(updatedQuestions);
        }
    };

    const handleCertaintyChange = (event) => {
        const newCertaintyIndex = parseInt(event.target.value, 10);

        setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            const selectedQuestionIndex = updatedQuestions.findIndex(question => (
                question.question === ''
                    ? question.figure === selectedQuestion.figure
                    : question.question === selectedQuestion.question
            ));

            if (selectedQuestionIndex !== -1) {
                updatedQuestions[selectedQuestionIndex].studentCRI = newCertaintyIndex;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            studentCRI: newCertaintyIndex,
        }));

        setCertaintyIndex(newCertaintyIndex);
    };

    useEffect(() => {
        let intervalId;

        const startTimer = () => {
            intervalId = setInterval(() => {
                setQuestions((prevQuestions) => {
                    const updatedQuestions = [...prevQuestions];
                    const selectedQuestionIndex = updatedQuestions.findIndex(
                        (question) =>
                            (question.question === '' ? question.figure === selectedQuestion.figure : question.question === selectedQuestion.question)
                    );

                    if (selectedQuestionIndex !== -1) {
                        updatedQuestions[selectedQuestionIndex].time += 1;
                    }

                    return updatedQuestions;
                });
            }, 1000);
        };

        const stopTimer = () => {
            clearInterval(intervalId);
        };

        if (selectedQuestion) {
            startTimer();
        }

        return () => {
            stopTimer();
        };
    }, [selectedQuestion]);

    return (
        loading ? (
            <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
                <div className="spinner-border" role="status"
                    style={{
                        color: colors.accent
                    }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        ) :
            (selectedQuestion && (
                <AssessmentPageLayout itemNumber={selectedQuestion.itemNumber} totalItems={questions.length} questions={questions} studentAssessmentId={assessmentId} classId={classId} studentId={studentId}>
                    <div className='w-100 h-100 d-flex flex-row justify-content-start align-items-start'>
                        <div className='w-25 h-100 p-4'
                            style={{
                                backgroundColor: colors.dark,
                                overflowY: "auto",
                            }}
                        >
                            <div className="w-100">
                                <div className="row row-cols-lg-5 row-cols-md-3 row-cols-sm-2 row-cols-1 row-gap-3">
                                    {questions.map((question, index) => (
                                        <div className="col d-flex justify-content-center align-items-center" key={index}
                                            style={{
                                                height: "50px",
                                            }}
                                        >
                                            <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded' onClick={() => handleQuestionClick(question, index)}
                                                style={{
                                                    width: "50px",
                                                    cursor: "pointer",
                                                    backgroundColor:
                                                        question.isForReview
                                                            ? colors.wrong
                                                            : question.studentAnswer === null
                                                                ? colors.light
                                                                : colors.correct,
                                                }}
                                            >
                                                <b style={{ color: colors.dark }}>{index + 1}</b>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='w-75 h-100 p-4'
                            style={{
                                backgroundColor: colors.light,
                                overflowY: "auto",
                            }}
                        >
                            <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-start gap-2'>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="flexCheckDefault" checked={selectedQuestion.isForReview} onChange={handleCheckboxChange} />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Mark as For Review
                                    </label>
                                </div>
                                <p className='mb-0'>
                                    {selectedQuestion && selectedQuestion.question}
                                </p>
                                {selectedQuestion && selectedQuestion.figure && (
                                    <div className='w-100 d-flex justify-content-center align-items-center'>

                                        <img src={selectedQuestion.figure} alt="Figure" className='img-fluid' />

                                    </div>
                                )}
                                {selectedQuestion && selectedQuestion.choices.map((choice, index) => {
                                    const radioButtonId = `flexRadioDefault${index + 1}`;
                                    const isUserAnswer = selectedQuestion.studentAnswer === choice;

                                    return (
                                        <div key={index} className="form-check mb-0 d-table">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id={radioButtonId}
                                                onChange={handleRadioChange}
                                                name="answer"
                                                checked={isUserAnswer}
                                                value={choice}
                                            />
                                            {choice.startsWith('https://') ? (
                                                <img src={choice} alt={`Choice ${index + 1}`}
                                                    style={{
                                                        maxWidth: "50%",
                                                        height: "auto",
                                                    }}
                                                />
                                            ) : (
                                                <label className="form-check-label" htmlFor={radioButtonId}>
                                                    {choice}
                                                </label>
                                            )}
                                        </div>
                                    );
                                })}
                                <div className='w-100 p-4'
                                    style={{
                                        backgroundColor: colors.dark,
                                        borderRadius: "10px",
                                    }}
                                >
                                    <label htmlFor="customRange3" className="form-label w-100 text-center" style={{ color: colors.light }}>{getCertaintyLabel(selectedQuestion.studentCRI)}</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        id="customRange3"
                                        value={selectedQuestion.studentCRI}
                                        onChange={handleCertaintyChange}
                                    />

                                </div>
                                <div className='w-100' style={{ minHeight: '24px' }} />
                            </div>
                        </div>
                    </div>
                </AssessmentPageLayout>
            )
            )
    )
}

export default AssessmentPage