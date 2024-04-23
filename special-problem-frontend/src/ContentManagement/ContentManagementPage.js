import React, { useEffect, useState } from 'react'
import ContentManagementHeader from './ContentManagementHeader'
import SmallLoading from '../Components/SmallLoading.js';
import { useNavigate } from 'react-router-dom';
import colors from '../colors'
import { firestore, firebaseApp } from '../firebaseConfig.js'
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { decrypt } from '../Utilities/utils'

function ContentManagementPage() {
    const navigate = useNavigate();
    const storage = getStorage(firebaseApp);
    const role = decrypt(sessionStorage.getItem('role'), "PHILNICIENT");
    const [field, setField] = useState('Technology');
    const [majorCategory, setMajorCategory] = useState('Basic Theory');
    const [question, setQuestion] = useState('');
    const [figure, setFigure] = useState(null);
    const [areChoicesText, setAreChoicesText] = useState(true);
    const [areChoicesImage, setAreChoicesImage] = useState(false);
    const [choices, setChoices] = useState(["", "", "", ""]);
    const [choiceImages, setChoiceImages] = useState([]);
    const [answer, setAnswer] = useState("");
    const [answerIndex, setAnswerIndex] = useState(0);
    const [choicesError, setChoicesError] = useState(false);
    const [questionDataError, setQuestionDataError] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (role !== 'Admin') {
            navigate('/page-not-found')
        }
    }, [role, navigate]);

    const handleFieldChange = (e) => {
        setField(e.target.value);
    };

    const handleMajorCategoryChange = (e) => {
        setMajorCategory(e.target.value);
    };

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleFigureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFigure(imageUrl);
        }
    };

    const choicesAreText = () => {
        setAreChoicesText(true);
        setAreChoicesImage(false);
        setChoiceImages([]);
        setAnswer('');
    }

    const choicesAreImage = () => {
        setAreChoicesText(false);
        setAreChoicesImage(true);
        setChoices([]);
        setAnswer('');
    }

    const handleChoiceChange = (index, event) => {
        const newChoices = [...choices];
        newChoices[index] = event.target.value;
        setChoices(newChoices);
    };

    const handleSelectAnswer = (index) => {
        if (areChoicesText) {
            const newAnswer = choices[index];
            setAnswer(newAnswer);
        }
        else if (areChoicesImage) {
            setAnswerIndex(index);
        }
    };

    const handleChoiceImagesUpload = (event) => {
        const files = event.target.files;
        const imageUrls = [];

        for (let i = 0; i < files.length; i++) {
            const imageUrl = URL.createObjectURL(files[i]);
            imageUrls.push(imageUrl);
        }

        setChoiceImages(imageUrls);
    };

    const handleClear = () => {
        setField('Technology');
        setMajorCategory('Basic Theory');
        setQuestion('');
        setFigure(null);
        setAreChoicesText(true);
        setAreChoicesImage(false);
        setChoices(["", "", "", ""]);
        setChoiceImages([]);
        setAnswer('');

        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.checked = false;
        });

        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = null;
        });
    };

    const getRandomFileName = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let fileName = '';
        for (let i = 0; i < 10; i++) {
            fileName += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return fileName;
    };

    const isFileNameExists = async (storageRef, fileName) => {
        try {
            await getDownloadURL(storageRef.child(fileName));
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleSubmit = async () => {
        if ((question || figure) && (answer || answerIndex !== null)) {
            let arePopulated = false;
            let hasCorrectLength = false;

            if (areChoicesText) {
                arePopulated = choices.every(choice => choice.trim() !== "");
                hasCorrectLength = choices.length === 4;
            } else {
                arePopulated = choiceImages.every(choice => choice.trim() !== "");
                hasCorrectLength = choiceImages.length === 4;
            }

            if (arePopulated && hasCorrectLength) {
                setSubmitLoading(true);
                let questionData = {};
                let imageUrls = [];
                let figureDownloadURL = null;
                if (areChoicesImage) {
                    for (let i = 0; i < choiceImages.length; i++) {
                        const file = choiceImages[i];
                        let fileName;
                        let isExists;
                        let storageRef;
                        do {
                            fileName = getRandomFileName();
                            isExists = await isFileNameExists(storage, `choices/${fileName}`);
                        } while (isExists);

                        const blob = await fetch(file).then(response => response.blob());

                        storageRef = ref(storage, `choices/${fileName}`);
                        await uploadBytes(storageRef, blob, { contentType: file.type });
                        const downloadURL = await getDownloadURL(storageRef);
                        imageUrls.push(downloadURL);
                    }
                }

                if (figure) {
                    const figureFile = await fetch(figure).then(response => response.blob());
                    let fileName;
                    let isExists;
                    let storageRef;
                    do {
                        fileName = getRandomFileName();
                        isExists = await isFileNameExists(storage, `figures/${fileName}`);
                    } while (isExists);

                    storageRef = ref(storage, `figures/${fileName}`);
                    await uploadBytes(storageRef, figureFile, { contentType: figureFile.type });
                    figureDownloadURL = await getDownloadURL(storageRef);
                }

                questionData = {
                    tag: majorCategory,
                    question: question,
                    figure: figureDownloadURL,
                    choices: areChoicesText ? choices : imageUrls,
                    answer: areChoicesText ? answer : imageUrls[answerIndex],
                };

                try {
                    await addDoc(collection(firestore, field), questionData);
                    setSubmitSuccess(true);
                    setTimeout(() => {
                        setSubmitSuccess(false);
                    }, 5000);
                    setSubmitLoading(false);
                    handleClear();
                } catch (e) {
                    setSubmitLoading(false);
                    console.error("Error adding document: ", e);
                }
            } else {
                if (!hasCorrectLength) {
                    setChoicesError(true);
                } else {
                    setChoicesError(true);
                }
                setTimeout(() => {
                    setChoicesError(false);
                }, 5000);
            }
        } else {
            setQuestionDataError(true);
            setTimeout(() => {
                setQuestionDataError(false);
            }, 5000);
        }
    };

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <ContentManagementHeader />
            <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                style={{
                    height: "calc(100% - 100px)",
                    overflowY: "auto",
                }}
            >
                <div className='w-75 d-flex flex-column justify-content-start align-items-center gap-2'>
                    <div className="w-100 mb-3">
                        <label htmlFor="fieldInput" className="form-label">Field</label>
                        <select className="form-select" id='fieldInput' value={field} onChange={handleFieldChange}>
                            <option>Technology</option>
                            <option>Management</option>
                            <option>Strategy</option>
                        </select>
                    </div>
                    <div className="w-100 mb-3">
                        <label htmlFor="categoryInput" className="form-label">Major Category</label>
                        <select className="form-select" id='categoryInput' value={majorCategory} onChange={handleMajorCategoryChange}>
                            <option>Basic Theory</option>
                            <option>Computer Systems</option>
                            <option>Technical Elements</option>
                            <option>Development Techniques</option>
                            <option>Project Management</option>
                            <option>Service Management</option>
                            <option>System Strategy</option>
                            <option>Management Strategy</option>
                            <option>Corporate & Legal Affairs</option>
                        </select>
                    </div>
                    <div className="w-100 mb-3">
                        <label htmlFor="questionInput" className="form-label">Question</label>
                        <textarea className="form-control" placeholder="Question" id="questionInput" value={question} onChange={handleQuestionChange}></textarea>
                    </div>
                    <div className="w-100 mb-3">
                        <label htmlFor="formFile" className="form-label">Figure</label>
                        <input className="form-control" type="file" id="formFile" onChange={handleFigureUpload} />
                    </div>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {figure && <img className='w-100' src={figure} alt="Figure" />}
                    </div>
                    <div className="w-100 mb-3">
                        <div className='w-100 d-flex flex-row justify-content-between align-items-center'>
                            <label className="form-label">Choices</label>
                            <div>
                                <button type='button' className='btn' onClick={choicesAreText}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={areChoicesText ? colors.accent : colors.dark} className="bi bi-type" viewBox="0 0 16 16">
                                        <path d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081zm2.7-7.923L6.34 9.314H3.51l1.4-4.156zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525" />
                                    </svg>
                                </button>
                                <button type='button' className='btn' onClick={choicesAreImage}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={areChoicesImage ? colors.accent : colors.dark} className="bi bi-image" viewBox="0 0 16 16">
                                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {areChoicesText && (
                            <div className='w-100 d-flex flex-column gap-2'>
                                <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="choice"
                                        onChange={() => handleSelectAnswer(0)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="A"
                                        value={choices[0]}
                                        onChange={(event) => handleChoiceChange(0, event)}
                                    />
                                </div>
                                <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="choice"
                                        onChange={() => handleSelectAnswer(1)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="B"
                                        value={choices[1]}
                                        onChange={(event) => handleChoiceChange(1, event)}
                                    />
                                </div>
                                <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="choice"
                                        onChange={() => handleSelectAnswer(2)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="C"
                                        value={choices[2]}
                                        onChange={(event) => handleChoiceChange(2, event)}
                                    />
                                </div>
                                <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="choice"
                                        onChange={() => handleSelectAnswer(3)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="D"
                                        value={choices[3]}
                                        onChange={(event) => handleChoiceChange(3, event)}
                                    />
                                </div>
                            </div>
                        )}
                        {areChoicesImage && (
                            <input className="form-control" type="file" id="formFileMultiple" multiple onChange={handleChoiceImagesUpload} />
                        )}
                    </div>
                    <div className='w-100 d-flex flex-column justify-content-start align-items-start gap-2'>
                        {choiceImages.map((choice, index) => (
                            <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2' key={index}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="choice"
                                    onChange={() => handleSelectAnswer(index)}
                                />
                                <img className='w-100' src={choice} alt={`Choice ${index}`} />
                            </div>
                        ))}
                    </div>
                    {choicesError && (
                        <div className="w-100 alert alert-info" role="alert">
                            There must be exactly four choices.
                        </div>
                    )}
                    {questionDataError && (
                        <div className="w-100 alert alert-info" role="alert">
                            Question, figure, and answer must have inputs.
                        </div>
                    )}
                    {submitSuccess && (
                        <div className="w-100 alert alert-info" role="alert">
                            Question submitted successfully.
                        </div>
                    )}
                    <div className='w-100 d-flex flex-row justify-content-center align-items-center gap-2'>
                        <button className="btn btn-primary" type="button" onClick={handleClear}
                            style={{
                                width: "100px",
                                height: "40px",
                                borderRadius: "10px",
                                backgroundColor: colors.accent,
                                borderColor: colors.accent,
                                color: colors.darkest,
                            }}
                        >
                            Clear
                        </button>
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
                            {submitLoading ? <SmallLoading /> : "Submit"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ContentManagementPage