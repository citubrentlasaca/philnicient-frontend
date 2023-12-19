import React from 'react'
import AssessmentPageHeader from './AssessmentPageHeader'
import AssessmentPageFooter from './AssessmentPageFooter'

function AssessmentPageLayout({ children, itemNumber, totalItems, questions }) {
    return (
        <div className='w-100 h-100 d-flex flex-column justify-content-start align-items-center'>
            <AssessmentPageHeader />
            <main className='w-100'
                style={{
                    height: "calc(100% - 200px)",
                }}
            >
                {children}
            </main>
            <AssessmentPageFooter itemNumber={itemNumber} totalItems={totalItems} questions={questions} />
        </div>
    )
}

export default AssessmentPageLayout