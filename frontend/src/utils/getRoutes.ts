import { RouteObject } from 'react-router-dom';
import { router } from '../main';

const getRoutes = (router: RouteObject[]): RouteObject[] => {
    return router.flatMap(route => route.children ? route.children : []);
};

export default getRoutes;
