import React from 'react'
import LandingPageHeader from './InstructionsPageHeader'
import colors from '../colors'
import answerquestions from '../Images/answerquestions.png'
import mark from '../Images/mark.png'
import scale from '../Images/scale.png'
import modal from '../Images/modal.png'
import navigationbuttons from '../Images/navigationbuttons.png'
import number from '../Images/number.png'
import start from '../Images/start.png'
import status from '../Images/status.png'
import submit from '../Images/submit.png'
import timeremaining from '../Images/timeremaining.png'

function LandingPage() {
    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <LandingPageHeader />
            <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-center gap-4'
                style={{
                    height: "calc(100% - 100px)",
                    overflowY: "auto",
                }}
            >
                <h1 className='w-75 mb-0 text-center'
                    style={{
                        fontFamily: "Montserrat Black",
                        color: colors.dark,
                    }}
                >
                    Instructions
                </h1>
                <ol className='w-75' style={{ textAlign: "justify", color: colors.dark }}>
                    <li>
                        <strong>Initiating the Assessment:</strong>
                        <ul>
                            <li>Click on the "Start" button located on the right side of the header.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={start} />
                            </div>
                            <li>A dialog box will appear, prompting you to start the assessment. Choose "Yes" or "No" to proceed.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={modal} />
                            </div>
                        </ul>
                    </li>

                    <li>
                        <strong>Assessment Interface:</strong>
                        <ul>
                            <li>Once the assessment starts, note that you cannot exit fullscreen mode or refresh the page during the assessment.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Navigating and Answering Questions:</strong>
                        <ul>
                            <li>On the assessment page, find the time remaining on the right side of the header.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={timeremaining} />
                            </div>
                            <li>Use the navigation buttons on the left side to move between questions.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={navigationbuttons} />
                            </div>
                            <li>Answer questions on the right side of the page. Your current question number is displayed on the left side of the footer.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={answerquestions} />
                            </div>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={number} />
                            </div>
                            <li>If you reach the last question, a "Submit" button will appear on the right side of the footer.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={submit} />
                            </div>
                        </ul>
                    </li>
                    <li>
                        <strong>Certainty of Response Index Scale:</strong>
                        <ul>
                            <li>Below each question, you have to adjust the scale according to how certain you are of your answer.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={scale} />
                            </div>
                            <li>0 - Totally Guessed Answer</li>
                            <li>1 - Almost Guess</li>
                            <li>2 - Not Sure</li>
                            <li>3 - Sure</li>
                            <li>4 - Almost Certain</li>
                            <li>5 - Certain</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Marking Questions for Review:</strong>
                        <ul>
                            <li>To mark a question for review, check the checkbox located above each question.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={mark} />
                            </div>
                        </ul>
                    </li>

                    <li>
                        <strong>Question Status Indicators:</strong>
                        <ul>
                            <li>Unanswered questions have white navigation buttons.</li>
                            <li>Answered questions have green navigation buttons.</li>
                            <li>Questions marked for review have red navigation buttons.</li>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                <img className='img-fluid rounded' src={status} />
                            </div>
                        </ul>
                    </li>

                    <li>
                        <strong>Exponent Symbol (^) Usage:</strong>
                        <ul>
                            <li>If you encounter the symbol "^" in questions or choices, it represents an exponent. For example, 2^2 means 2 to the power of 2.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Automatic Submission on Time Expiry:</strong>
                        <ul>
                            <li>If the time remaining runs out, the assessment will automatically submit.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Post-Assessment Actions:</strong>
                        <ul>
                            <li>After submission, view your overall score.</li>
                            <li>Review the assessment and identify proficiency levels across nine major categories with AI assistance.</li>
                        </ul>
                    </li>
                </ol>

            </div>
        </div>
    )
}

export default LandingPage