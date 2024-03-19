import React from 'react'
import colors from '../colors'

function SmallLoading() {
    return (
        <div className='w-100 h-100 d-flex justify-content-center align-items-center'>
            <div className="spinner-border spinner-border-sm" role="status"
                style={{
                    color: colors.dark,
                }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}

export default SmallLoading