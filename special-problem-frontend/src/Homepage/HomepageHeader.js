import React from 'react'
import colors from '../colors'
import logo from '../Icons/logo.png'

function HomepageHeader() {
    return (
        <div className='w-100 p-4 d-flex flex-row justify-content-between align-items-center'
            style={{
                height: "100px",
                backgroundColor: colors.darkest,

            }}
        >
            <img src={logo} alt="Logo"
                style={{
                    height: "50px",
                    width: "50px"
                }}
            />
            <button className="btn btn-primary" type="button"
                style={{
                    width: "100px",
                    borderRadius: "10px",
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.darkest,
                }}
            >
                Log Out
            </button>
        </div>
    )
}

export default HomepageHeader