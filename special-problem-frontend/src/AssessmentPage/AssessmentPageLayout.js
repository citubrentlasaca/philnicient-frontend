import React, { useEffect, useState } from 'react'
import AssessmentPageHeader from './AssessmentPageHeader'
import AssessmentPageFooter from './AssessmentPageFooter'

function AssessmentPageLayout({ children, itemNumber, totalItems, questions }) {
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 2,
        minutes: 30,
        seconds: 0,
    });

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

    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <AssessmentPageHeader timeRemaining={timeRemaining} />
            <main className='w-100'
                style={{
                    height: "calc(100% - 200px)",
                }}
            >
                {children}
            </main>
            <AssessmentPageFooter itemNumber={itemNumber} totalItems={totalItems} questions={questions} timeRemaining={timeRemaining} />
        </div>
    )
}

export default AssessmentPageLayout