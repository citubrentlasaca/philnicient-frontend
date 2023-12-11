import React from 'react'
import LandingPageHeader from './LandingPageHeader'
import colors from '../colors'

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
                <h1 className='w-50 mb-0 text-center'
                    style={{
                        fontFamily: "Montserrat Black",
                        color: colors.dark,
                    }}
                >
                    Welcome to PhilNITS Proficiency Assessment
                </h1>
                <p className='w-50 mb-0'
                    style={{
                        color: colors.dark,
                        textAlign: "justify",
                    }}
                >
                    PhilNITS Proficiency Assessment is a cutting-edge application designed to evaluate the proficiency level of users in the nine major categories of the PhilNITS FE Exam. Harnessing the power of artificial intelligence, this innovative tool goes beyond traditional assessments by not only gauging one's understanding but also identifying areas of misunderstanding. The application employs advanced algorithms to analyze user responses, providing a comprehensive overview of strengths and weaknesses. Through an intuitive interface, PhilNITS Proficiency Assessment delivers personalized insights, helping users to focus on specific topics that require attention and improvement. Whether preparing for the PhilNITS FE Exam or seeking to enhance one's knowledge in information technology and systems, this application offers a dynamic and efficient way to measure and refine proficiency across key subject areas.
                </p>
                <hr
                    style={{
                        width: "50%",
                        height: "1px",
                        color: colors.dark,
                    }}
                />
                <h1 className='w-75 mb-0 text-center'
                    style={{
                        fontFamily: "Montserrat Black",
                        color: colors.dark,
                    }}
                >
                    Instructions
                </h1>
                <p className='w-50 mb-0'
                    style={{
                        color: colors.dark,
                        textAlign: "justify",
                    }}
                >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in posuere augue. Nam id aliquam ligula. Donec eu vulputate leo. Vivamus velit magna, imperdiet eget convallis eget, lacinia sed arcu. Quisque ultricies a est et tempus. Donec malesuada, tellus a aliquet volutpat, neque massa venenatis metus, et suscipit erat nibh vestibulum velit. Nulla commodo efficitur odio, sed pretium turpis iaculis eget. Mauris imperdiet erat sit amet libero rhoncus, id molestie urna rutrum. Donec volutpat eros et orci hendrerit convallis. Fusce auctor ornare bibendum. Ut pulvinar metus vitae risus pellentesque sollicitudin. Ut eu ultrices ipsum, vel molestie ipsum.
                </p>
                <p className='w-50 mb-0'
                    style={{
                        color: colors.dark,
                        textAlign: "justify",
                    }}
                >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in posuere augue. Nam id aliquam ligula. Donec eu vulputate leo. Vivamus velit magna, imperdiet eget convallis eget, lacinia sed arcu. Quisque ultricies a est et tempus. Donec malesuada, tellus a aliquet volutpat, neque massa venenatis metus, et suscipit erat nibh vestibulum velit. Nulla commodo efficitur odio, sed pretium turpis iaculis eget. Mauris imperdiet erat sit amet libero rhoncus, id molestie urna rutrum. Donec volutpat eros et orci hendrerit convallis. Fusce auctor ornare bibendum. Ut pulvinar metus vitae risus pellentesque sollicitudin. Ut eu ultrices ipsum, vel molestie ipsum.
                </p>
            </div>
        </div>
    )
}

export default LandingPage