import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'

function LandingPageHeader() {
    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
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
            <button className="btn btn-primary" type="button"
                style={{
                    width: "100px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.dark,
                }}
            >
                Start
            </button>
        </div>
    )
}

export default LandingPageHeader