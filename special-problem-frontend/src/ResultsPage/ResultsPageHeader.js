import React from 'react'
import colors from '../colors';
import logo from '../Icons/logo.png'

function ResultsPageHeader() {
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
        </div>
    )
}

export default ResultsPageHeader