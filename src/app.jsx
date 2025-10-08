import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { About } from './about/about';

const NAVBAR_ROUTES = ['/play', '/about'];

const Navbar = () => {
    return (
        <menu className="navbar-nav">
            <li className="nav-item"><NavLink className="nav-link" to="play">Play</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link active" to="about">About</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="index">Logout</NavLink></li>
        </menu>
    );
};

export default function App() {
    const location = useLocation();
    const showNavbar = NAVBAR_ROUTES.includes(location.pathname);

    return (
            <div className="body">
                <header id="page-header">
                    <nav className="navbar fixed-top navbar-dark">
                        <h1 className="navbar-brand" href="#">Blackjack</h1>
                    </nav>

                    {showNavbar && <Navbar />}
                </header>

                <main>App components go here</main>

                <footer>
                    <br />
                    <span>A site by Weston Chorak</span>
                    <br />
                    <a href="https://github.com/wjchorak/startup">Github</a>
                </footer>
            </div>
    );
}