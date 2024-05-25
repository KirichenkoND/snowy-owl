import React from 'react';
import MarksComponent from '../../components/MarksComponent/MarksComponent';
import MarksTableComponent from '../../components/MarksTableComponent/MarksTableComponent';


const MarksPage: React.FC = () => {
    return (
        <>
            <h1>MarksPage</h1>
            <MarksComponent />
            <MarksTableComponent />
        </>
    )
}

export default MarksPage;