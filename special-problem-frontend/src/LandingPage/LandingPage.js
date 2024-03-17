import React from 'react'
import colors from '../colors'
import LandingPageHeader from './LandingPageHeader'
import LandingPageHeroSection from '../Images/LandingPageHeroSection.png'
import { Link } from 'react-router-dom'

function LandingPage() {
    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <LandingPageHeader />
            <div className='w-100 d-flex flex-column justify-content-start align-items-center gap-4 p-4'
                style={{
                    height: "calc(100% - 100px)",
                    overflowY: "auto",
                }}
            >
                <div className='w-75 d-flex flex-row justify-content-evenly align-items-center gap-2'>
                    <div className='w-50 d-flex flex-column justify-content-start align-items-start gap-2'>
                        <h1
                            style={{
                                fontFamily: "Montserrat Black"
                            }}
                        >
                            Master the PhilNITS FE Exam with Philnicient
                        </h1>
                        <h3>
                            Your AI-Powered Path to Success
                        </h3>
                        <Link to="/signup">
                            <button className="btn btn-primary" type="button"
                                style={{
                                    width: "200px",
                                    borderRadius: "10px",
                                    backgroundColor: colors.accent,
                                    borderColor: colors.accent,
                                    color: colors.darkest,
                                }}
                            >
                                Get Started
                            </button>
                        </Link>
                    </div>
                    <img src={LandingPageHeroSection} alt="Information Technology"
                        style={{
                            height: "auto",
                            width: "40%",
                        }}
                    />
                </div>
                <div className='w-75 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <h3
                        style={{
                            fontFamily: "Montserrat Black"
                        }}
                    >
                        What is Philnicient?
                    </h3>
                    <p className='mb-0'
                        style={{
                            textAlign: "justify"
                        }}
                    >
                        Welcome to Philnicient, your go-to platform for mastering the PhilNITS FE Exam. Designed for both students and professionals, our AI-powered application meticulously assesses your knowledge across the nine key categories of the PhilNITS FE Exam. Through advanced analysis, Philnicient not only identifies your strengths but also pinpoints areas where you may need improvement or clarification, highlighting misconceptions for targeted learning. Say goodbye to uncertainty and embrace confidence as you prepare to conquer the PhilNITS FE Exam with Philnicient by your side.
                    </p>
                </div>
                <hr className='w-75' />
                <div className='w-75 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <h3
                        style={{
                            fontFamily: "Montserrat Black"
                        }}
                    >
                        What is the PhilNITS FE Exam?
                    </h3>
                    <p className='mb-0'
                        style={{
                            textAlign: "justify"
                        }}
                    >
                        The PhilNITS FE Exam is tailored for individuals poised to advance their careers in the IT sector. Geared towards those with a solid foundation in IT fundamentals and practical skills, this exam assesses candidates engaged in strategic planning or the implementation of IT solutions, products, or services. From participating in strategic planning to designing and developing reliable systems, examinees are evaluated based on their ability to understand business objectives, analyze information strategies, and propose solutions under guidance. With a focus on both strategic planning and technical proficiency, the PhilNITS FE Exam corresponds with Level 2 of the Common Career/Skill Framework, encompassing roles such as Strategist, Systems Architect, Service Manager, Project Manager, and Technical Specialist.                    </p>
                </div>
                <hr className='w-75' />
                <div className='w-75 d-flex flex-column justify-content-center align-items-center gap-2'>
                    <h3
                        style={{
                            fontFamily: "Montserrat Black"
                        }}
                    >
                        Ready to Ace the PhilNITS FE Exam?
                    </h3>
                    <p className='mb-0'>
                        Start your journey towards success today with Philnicient.
                    </p>
                    <Link to="/signup">
                        <button className="btn btn-primary" type="button"
                            style={{
                                width: "200px",
                                borderRadius: "10px",
                                backgroundColor: colors.accent,
                                borderColor: colors.accent,
                                color: colors.darkest,
                            }}
                        >
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LandingPage