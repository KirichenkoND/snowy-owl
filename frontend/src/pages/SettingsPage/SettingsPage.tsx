import React from 'react';
import './SettingsPage.scss';
import SubjectsComponent from '../../components/SubjectsComponent/SubjectsComponent';
import ClassesComponent from '../../components/ClassesComponent/ClassesComponent';
import RoomsComponent from '../../components/RoomsComponent/RoomsComponent';


const SubjectsPage: React.FC = () => {
    return (
        <>
            <h1>Настройка системы АИС ШКОЛА</h1>
            <div className='settings-container'>
                <SubjectsComponent />
                <ClassesComponent />
                <RoomsComponent />
            </div>
        </>
    )
}

export default SubjectsPage;