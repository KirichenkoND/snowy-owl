// src/components/Header/Header.tsx
import React, { useState } from 'react';
import './Header.scss';
import HeaderLink from "../HeaderLink/HeaderLink";
import logo from "../../../public/favicon.ico";
import { router } from '../../main';
import { getRoutes, routeNames } from '../../utils/utils';

export const Header: React.FC = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const routes = getRoutes(router.routes);
    const headerLinks = routes.map((route, index) => {
        const path = route.path as string;
        const displayName = routeNames[path] || path;
        return <HeaderLink key={index} path={path} text={displayName} />;
    });

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <header>
            <div className="header">
                <div className="header-logo">
                    <HeaderLink image={logo} path="/" />
                </div>
                <button className="nav-toggle" onClick={toggleNav}>
                    ☰
                </button>
                <nav className={`header-nav ${isNavOpen ? 'open' : ''}`}>
                    {headerLinks}
                </nav>
            </div>
        </header>
    );
};

export default Header;
