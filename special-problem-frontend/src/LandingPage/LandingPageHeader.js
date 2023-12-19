import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'
import { Link, useNavigate } from 'react-router-dom'

function LandingPageHeader() {
    const navigate = useNavigate()

    const handleYesButtonClick = () => {
        navigate('/assessment');
    }
    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <div className="modal fade" id="staticBackdrop" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Do you want to start the assessment?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{ width: "50px", backgroundColor: colors.accent, border: "none" }}>No</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleYesButtonClick} style={{ width: "50px", backgroundColor: colors.accent, border: "none" }}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='d-flex flex-row justify-content-center align-items-center gap-4'>
                <img src={logo} alt="Logo"
                    style={{
                        height: "50px",
                        width: "50px"
                    }}
                />
                <h5 className='mb-0'
                    style={{
                        color: colors.accent,
                        fontFamily: "Montserrat Black",
                    }}
                >
                    PhilNITS Proficiency Assessment
                </h5>
            </div>
            <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop"
                style={{
                    width: "100px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                Start
            </button>
        </div>
    )
}

export default LandingPageHeader