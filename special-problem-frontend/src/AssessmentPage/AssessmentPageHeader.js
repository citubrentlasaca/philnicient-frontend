import React, { useEffect, useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'

function AssessmentPageHeader({ timeRemaining }) {
    const formatTime = (time) => (time < 10 ? `0${time}` : time);

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
            </div>
            <h5 className='mb-0'
                style={{
                    color: colors.accent,
                    fontFamily: "Montserrat",
                    fontWeight: "900",
                }}
            >
                Time Remaining: {`${formatTime(timeRemaining.hours)}:${formatTime(
                    timeRemaining.minutes
                )}:${formatTime(timeRemaining.seconds)}`}
            </h5>
        </div>
    )
}

export default AssessmentPageHeader