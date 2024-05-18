import React from 'react';
import './MainPage.scss';

import NavigationCard from "../../components/NavigationCard/NavigationCard";

import test_1 from "../../assets/monitor_loading.svg";
import test_2 from "../../assets/propusk.svg";
import test_3 from "../../assets/list_monitor.svg";
import test_4 from "../../assets/sistema_poiska.svg";
import test_5 from "../../assets/lichnyj_kabinet.svg";
import test_6 from "../../assets/software_po.svg";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const NavigationCardList = [
    {
        access: ["admin", "Teacher"],
        imageUrl: test_1,
        title: "Авторизация",
        link: "/auth",
    },
    {
        access: ["Teacher"],
        imageUrl: test_2,
        title: "Учебные классы",
        link: "/classes",
    },
    {
        access: ["admin", "Teacher"],
        imageUrl: test_3,
        title: "Предметы",
        link: "/subjects",
    },
    {
        access: ["admin", "Teacher"],
        imageUrl: test_4,
        title: "Аудитории",
        link: "/rooms",
    },
    {
        access: ["admin", "Teacher"],
        imageUrl: test_5,
        title: "Учителя",
        link: "/teachers",
    },
    {
        access: ["admin", "Teacher"],
        imageUrl: test_5,
        title: "Студенты",
        link: "/students",
    },
    {
        access: ["admin", "Teacher"],
        imageUrl: test_5,
        title: "Оценки",
        link: "/marks",
    },
    {
        access: ["Teacher"],
        imageUrl: test_6,
        title: "Настройки",
        link: "/settings",
    },
];

const MainPage: React.FC = () => {
    // const access = useSelector((state: RootState) => state.user.role);
    const access = "Teacher";

    return (
        <>
            <div>
                <h1>Главная страница</h1>
                <p>Добро пожаловать на страницу АИС ШКОЛА</p>
            </div>

            <div className="navigation-cards-container">
                {access &&
                    NavigationCardList.map((navigationCard, i) => {
                        if (navigationCard.access.includes(access)) {
                            return (
                                <NavigationCard
                                    key={i}
                                    imageUrl={navigationCard.imageUrl}
                                    title={navigationCard.title}
                                    link={navigationCard.link}
                                />
                            );
                        }
                        return null; // Необходимо возвращать null, если условие не выполнено
                    })}
            </div>
        </>
    );
}

export default MainPage;
