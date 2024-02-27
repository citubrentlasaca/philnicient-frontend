import React, { useEffect, useState } from 'react'
import HomepageHeader from './HomepageHeader'
import colors from '../colors'

function Homepage() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(false)
    }, [])

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
        ) : (
            <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
                <div className="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="classNameInput" className="form-label">Class name</label>
                                <input type="text" className="form-control" id="classNameInput" />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Cancel</button>
                                <button type="button" className="btn btn-primary" data-bs-target="#exampleModalToggle2" data-bs-toggle="modal" style={{ width: "100px", backgroundColor: colors.accent, color: colors.dark, border: "none" }}>Create</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="exampleModalToggle2" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body d-flex flex-column justify-content-center align-items-center">
                                <p>Copy this code to let students join your class:</p>
                                <h1>123456</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <HomepageHeader />
                <div className='w-100 p-4 d-flex flex-column justify-content-start align-items-start gap-4'
                    style={{
                        height: "calc(100% - 100px)",
                        overflowY: "auto",
                    }}
                >
                    <b style={{ color: colors.dark }}>Classes</b>
                    <div className="text-center w-100">
                        <div className="row row-cols-md-4 row-cols-sm-2 row-cols-1 row-gap-1">
                            <div className="col"
                                style={{
                                    height: "250px",
                                    padding: "10px"
                                }}
                            >
                                <div className='h-100 d-flex flex-column justify-content-center align-items-center rounded' data-bs-target="#exampleModalToggle" data-bs-toggle="modal"
                                    style={{
                                        border: `3px dashed ${colors.dark}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill={colors.dark} className="bi bi-plus-lg" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                    </svg>
                                    <p style={{ color: colors.dark }}>Create a new class</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default Homepage