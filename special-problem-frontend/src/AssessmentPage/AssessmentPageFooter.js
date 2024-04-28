import React, { useEffect, useState } from 'react'
import colors from '../colors'
import { useNavigate } from 'react-router-dom'
import SmallLoading from '../Components/SmallLoading';
import api from '../Utilities/api';

function AssessmentPageFooter({ itemNumber, totalItems, questions, timeRemaining, assessmentId, studentId }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true);

        try {
            await api.put('/questions/update-multiple-questions', questions);
        } catch (error) {
            //console.error('Error updating questions:', error);
        }

        try {
            await api.put(`/assessments/${assessmentId}`, {
                student_id: studentId,
                is_submitted: true,
            })
        }
        catch (error) {
            // console.error('Error updating assessment:', error);
        }

        navigate(`/results`);
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
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to submit?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                style={{
                                    width: "100px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    backgroundColor: colors.accent,
                                    borderColor: colors.accent,
                                    color: colors.darkest,
                                }}
                            >
                                No
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}
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
                                    <SmallLoading />
                                ) : (
                                    <p>Yes</p>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <h5 className='mb-0'
                style={{
                    color: colors.accent,
                    fontFamily: "Montserrat",
                    fontWeight: "900",
                }}
            >
                {itemNumber} out of {totalItems}
            </h5>
            <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop"
                style={{
                    width: "100px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                <p className="mb-0">Submit</p>
            </button>
        </div>
    )
}

export default AssessmentPageFooter