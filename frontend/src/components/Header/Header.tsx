import React from 'react';
import './Header.scss';
import HeaderLink from "../HeaderLink/HeaderLink";
import logo from "../../../public/favicon.ico";
import { router } from '../../main';
import getRoutes from '../../utils/getRoutes';

export const Header: React.FC = () => {
    const routes = getRoutes(router.routes); 
    const headerLinks = routes.map((route, index) => (
        <HeaderLink key={index} path={route.path as string} text={route.path} />
    ));
    return (
        <>
            <header>
                <div className="header">
                    <div className="header-logo">
                        <HeaderLink image={logo} path="/" />
                    </div>
                    <nav className="header-nav">
                        {headerLinks}
                    </nav>
                </div>
            </header>
        </>
    )
}