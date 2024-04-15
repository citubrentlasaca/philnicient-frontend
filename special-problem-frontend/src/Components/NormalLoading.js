import React from 'react'
import colors from '../colors'

function NormalLoading() {
    return (
        <div className='w-100 h-100 d-flex justify-content-center align-items-center' >
            <div className="spinner-border" role="status"
                style={{
                    color: colors.accent
                }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}

export default NormalLoading