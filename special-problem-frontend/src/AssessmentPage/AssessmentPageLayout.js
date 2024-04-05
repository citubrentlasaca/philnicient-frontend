import React, { useEffect, useState } from 'react'
import AssessmentPageHeader from './AssessmentPageHeader'
import AssessmentPageFooter from './AssessmentPageFooter'
import axios from 'axios';

function AssessmentPageLayout({ children, itemNumber, totalItems, questions, studentAssessmentId, classId, studentId }) {
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 2,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/assessments/${studentAssessmentId}`);

                const { datetimecreated } = response.data;
                const currentTime = new Date();
                const assessmentTime = new Date(datetimecreated);
                const timeDifference = Math.abs(currentTime - assessmentTime);

                const remainingMilliseconds = 2 * 60 * 60 * 1000 - timeDifference;
                const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
                const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);

                setTimeRemaining({
                    hours: remainingHours,
                    minutes: remainingMinutes,
                    seconds: remainingSeconds,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const countdown = setInterval(() => {
            if (timeRemaining.hours <= 0 && timeRemaining.minutes <= 0 && timeRemaining.seconds <= 0) {
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
            <AssessmentPageFooter itemNumber={itemNumber} totalItems={totalItems} questions={questions} timeRemaining={timeRemaining} assessmentId={studentAssessmentId} classId={classId} studentId={studentId} />
        </div>
    )
}

export default AssessmentPageLayout