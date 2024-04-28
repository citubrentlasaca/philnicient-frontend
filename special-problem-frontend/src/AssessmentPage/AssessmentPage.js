import React, { useEffect, useState } from 'react'
import colors from '../colors';
import AssessmentPageLayout from './AssessmentPageLayout';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../Utilities/api';
import { decrypt } from '../Utilities/utils'

function AssessmentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { classId, studentId } = location.state || {};
    const { assessmentId } = useParams();
    const userId = sessionStorage.getItem('user_id');
    const [role, setRole] = useState('');
    const [questions, setQuestions] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [certaintyIndex, setCertaintyIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = sessionStorage.getItem('role');
        if (role !== "Teacher" && role !== "Student") {
            const adminRole = decrypt(role)
            setRole(adminRole)
        }
        else {
            setRole(role)
        }
    }, [role]);

    useEffect(() => {
        const modalBackdrop = document.querySelector('.modal-backdrop.fade.show');
        if (modalBackdrop) {
            modalBackdrop.parentNode.removeChild(modalBackdrop);
        }
    }, []);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                await api.get(`/assessments/${assessmentId}`)
            } catch (error) {
                // console.error("Assessment does not exist", error);
                navigate("/assessment-not-found");
            }
        }

        fetchClass();
    }, [assessmentId, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (role === 'Student') {
                    await api.get(`/students/${userId}/assessment/${assessmentId}`);
                }
                else if (role === 'Teacher' || role === 'Admin') {
                    navigate("/assessment-not-found")
                    // console.error("Assessment not found.");
                }
            } catch (error) {
                navigate("/assessment-not-found")
                // console.error("Assessment not found.");
            }
        }
        fetchData();
    }, [assessmentId, navigate, role, userId]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                let questionData = [];
                try {
                    const questions = await api.get(`/questions/assessment/${assessmentId}`);
                    questionData = questions.data;
                } catch (error) {
                    // console.error('Error fetching questions:', error);
                }

                setInterval(async () => {
                    try {
                        await api.put('/questions/update-multiple-questions', questionData);
                    } catch (error) {
                        //console.error('Error updating questions:', error);
                    }
                }, 60000);

                setQuestions(questionData);
                setSelectedQuestion({
                    ...questionData[0],
                    itemNumber: 1
                });
                setLoading(false);
            } catch (error) {
                // console.error('Error fetching questions:', error);
            }
        }

        fetchQuestions();
    }, []);

    const getCertaintyLabel = (student_cri) => {
        if (student_cri === 0) {
            return "Certainty of Response Index: Totally Guessed Answer";
        }
        else if (student_cri === 1) {
            return "Certainty of Response Index: Almost Guess";
        }
        else if (student_cri === 2) {
            return "Certainty of Response Index: Not Sure";
        }
        else if (student_cri === 3) {
            return "Certainty of Response Index: Sure";
        }
        else if (student_cri === 4) {
            return "Certainty of Response Index: Almost Certain";
        }
        else if (student_cri === 5) {
            return "Certainty of Response Index: Certain";
        }
    }

    const handleQuestionClick = (question, index) => {
        setSelectedQuestion({
            question: question.question,
            figure: question.figure,
            choices: question.choices,
            answer: question.answer,
            major_category: question.major_category,
            itemNumber: index + 1,
            student_answer: question.student_answer,
            student_cri: question.student_cri,
            is_for_review: question.is_for_review,
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
                updatedQuestions[selectedQuestionIndex].student_answer = selectedChoice;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            student_answer: selectedChoice,
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
            updatedQuestions[index].is_for_review = !updatedQuestions[index].is_for_review;

            setSelectedQuestion((prevSelectedQuestion) => ({
                ...prevSelectedQuestion,
                is_for_review: !prevSelectedQuestion.is_for_review,
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
                updatedQuestions[selectedQuestionIndex].student_cri = newCertaintyIndex;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            student_cri: newCertaintyIndex,
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
                                                        question.is_for_review
                                                            ? colors.wrong
                                                            : question.student_answer === null
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
                                    <input className="form-check-input" type="checkbox" id="flexCheckDefault" checked={selectedQuestion.is_for_review} onChange={handleCheckboxChange} />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Mark as For Review
                                    </label>
                                </div>
                                <p>
                                    {selectedQuestion && selectedQuestion.question}
                                </p>
                                {selectedQuestion && selectedQuestion.figure && (
                                    <div className='w-100 d-flex justify-content-center align-items-center'>

                                        <img src={selectedQuestion.figure} alt="Figure" className='img-fluid' />

                                    </div>
                                )}
                                {selectedQuestion && selectedQuestion.choices.map((choice, index) => {
                                    const radioButtonId = `flexRadioDefault${index + 1}`;
                                    const isUserAnswer = selectedQuestion.student_answer === choice;

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
                                    <label htmlFor="customRange3" className="form-label w-100 text-center" style={{ color: colors.light }}>{getCertaintyLabel(selectedQuestion.student_cri)}</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        id="customRange3"
                                        value={selectedQuestion.student_cri}
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