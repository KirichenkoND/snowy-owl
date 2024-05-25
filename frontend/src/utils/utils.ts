import { RouteObject } from 'react-router-dom';

export const getRoutes = (router: RouteObject[]): RouteObject[] => {
    return router.flatMap(route => route.children ? route.children : []);
};


export const routeNames: { [key: string]: string } = {
    '/': 'Главная',
    '/profile': 'Профиль',
    '/auth': 'Авторизация',
    '/classes': 'Классы',
    '/subjects': 'Предметы',
    '/rooms': 'Кабинеты',
    '/teachers': 'Учителя',
    '/students': 'Ученики',
    '/marks': 'Оценки',
    '/settings': 'Настройки',
};
