import React, { useEffect, useState } from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'

function AssessmentPageHeader() {
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 2,
        minutes: 30,
        seconds: 0,
    })

    useEffect(() => {
        const countdown = setInterval(() => {
            if (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
                clearInterval(countdown);
            } else {
                setTimeRemaining((prevTime) => {
                    if (prevTime.minutes === 0 && prevTime.seconds === 0) {
                        return {
                            hours: prevTime.hours - 1,
                            minutes: 59,
                            seconds: 59,
                        };
                    } else if (prevTime.seconds === 0) {
                        return {
                            ...prevTime,
                            minutes: prevTime.minutes - 1,
                            seconds: 59,
                        };
                    } else {
                        return {
                            ...prevTime,
                            seconds: prevTime.seconds - 1,
                        };
                    }
                });
            }
        }, 1000);

        return () => clearInterval(countdown);

    }, [timeRemaining]);

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
                <h5 className='mb-0'
                    style={{
                        color: colors.accent,
                        fontFamily: "Montserrat Black",
                    }}
                >
                    PhilNITS Proficiency Assessment
                </h5>
            </div>
            <h5 className='mb-0'
                style={{
                    color: colors.accent,
                    fontFamily: "Montserrat Black",
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