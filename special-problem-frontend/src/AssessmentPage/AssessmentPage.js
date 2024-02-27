import React, { useEffect, useState } from 'react'
import AssessmentPageHeader from './AssessmentPageHeader'
import colors from '../colors';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDocs, collection, query, where } from "firebase/firestore";
import AssessmentPageLayout from './AssessmentPageLayout';
const firebaseConfig = {
    apiKey: "AIzaSyBYslsNBGdOWBWDTKQDYqfmfxlF2wWm6aY",
    authDomain: "philnits-recommendation-system.firebaseapp.com",
    projectId: "philnits-recommendation-system",
    storageBucket: "philnits-recommendation-system.appspot.com",
    messagingSenderId: "179273781052",
    appId: "1:179273781052:web:37bec31b5751d7a8bd5839",
    measurementId: "G-ZJC36WWJWH"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function AssessmentPage() {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [certaintyIndex, setCertaintyIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const getCertaintyLabel = (userCRI) => {
        if (userCRI === 0) {
            return "Certainty of Response Index: Totally Guessed Answer";
        }
        else if (userCRI === 1) {
            return "Certainty of Response Index: Almost Guess";
        }
        else if (userCRI === 2) {
            return "Certainty of Response Index: Not Sure";
        }
        else if (userCRI === 3) {
            return "Certainty of Response Index: Sure";
        }
        else if (userCRI === 4) {
            return "Certainty of Response Index: Almost Certain";
        }
        else if (userCRI === 5) {
            return "Certainty of Response Index: Certain";
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchDocuments = async (collectionName, tag, count) => {
                    const q = query(collection(db, collectionName), where("tag", "==", tag));
                    const querySnapshot = await getDocs(q);
                    const documents = querySnapshot.docs.map((doc) => {
                        return {
                            id: doc.id,
                            ...doc.data(),
                            userAnswer: null,
                            userCRI: 0,
                            isForReview: false,
                            time: 0,
                        };
                    });

                    const shuffledDocuments = documents.sort(() => Math.random() - 0.5);
                    return shuffledDocuments.slice(0, count).map(({ question, figure, choices, answer, tag, userAnswer, userCRI, isForReview, time }) => ({
                        question,
                        figure,
                        choices,
                        answer,
                        tag,
                        userAnswer,
                        userCRI,
                        isForReview,
                        time,
                    }));
                };

                const basictheory = await fetchDocuments("Technology", "Basic Theory", 1);
                const computersystems = await fetchDocuments("Technology", "Computer Systems", 1);
                const technicalelements = await fetchDocuments("Technology", "Technical Elements", 1);
                const developmenttechniques = await fetchDocuments("Technology", "Development Techniques", 1);
                const projectmanagement = await fetchDocuments("Management", "Project Management", 1);
                const servicemanagement = await fetchDocuments("Management", "Service Management", 1);
                const systemstrategy = await fetchDocuments("Strategy", "System Strategy", 1);
                const managementstrategy = await fetchDocuments("Strategy", "Management Strategy", 1);
                const corporate = await fetchDocuments("Strategy", "Corporate & Legal Affairs", 1);

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

                setQuestions(allDocuments);
                if (allDocuments.length > 0) {
                    const firstQuestion = {
                        ...allDocuments[0],
                        itemNumber: 1,
                        userAnswer: null,
                        userCRI: 0,
                        isForReview: false,
                        time: 0,
                    };

                    setSelectedQuestion(firstQuestion);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleQuestionClick = (question, index) => {
        setSelectedQuestion({
            question: question.question,
            figure: question.figure,
            choices: question.choices,
            answer: question.answer,
            tag: question.tag,
            itemNumber: index + 1,
            userAnswer: question.userAnswer,
            userCRI: question.userCRI,
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
                updatedQuestions[selectedQuestionIndex].userAnswer = selectedChoice;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            userAnswer: selectedChoice,
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
                updatedQuestions[selectedQuestionIndex].userCRI = newCertaintyIndex;
            }
            return updatedQuestions;
        });

        setSelectedQuestion((prevQuestion) => ({
            ...prevQuestion,
            userCRI: newCertaintyIndex,
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
                <AssessmentPageLayout itemNumber={selectedQuestion.itemNumber} totalItems={questions.length} questions={questions}>
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
                                                            : question.userAnswer === null
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
                                    const isUserAnswer = selectedQuestion.userAnswer === choice;

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
                                    <label htmlFor="customRange3" className="form-label w-100 text-center" style={{ color: colors.light }}>{getCertaintyLabel(selectedQuestion.userCRI)}</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="5"
                                        step="1"
                                        id="customRange3"
                                        value={selectedQuestion.userCRI}
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