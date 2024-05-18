import React from 'react';
import "./HeaderLink.scss"
import { Link } from 'react-router-dom';

interface HeaderLinkProps {
    image?: string;
    text?: string;
    path: string;
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ image, text, path }) => {
    return (
        <a href={path} className='header-link-route' >
            <div className='header-link'>
                <Link to={path}>
                    {image && <img src={image} alt="icon" style={{ width: '70px', height: '70px' }} />}
                </Link>
                {text}
            </div>
        </a>
    );
};

export default HeaderLink;