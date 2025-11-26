import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { About } from './about/about';
import { AuthState } from './login/authState';

const NAVBAR_ROUTES = ['/play', '/about'];

const Navbar = () => {
    return (
        <menu className="navbar-nav">
            <li className="nav-item"><NavLink className="nav-link" to="/play">Play</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link active" to="/about">About</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/">Logout</NavLink></li>
        </menu>
    );
};

class webSocketClient {
    observers = [];
    connected = false;

    constructor() {
        const protocol = window.location.protocol === 'http' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

        this.socket.onopen = (event) => {
            this.notifyObservers('system', 'websocket', 'connected');
            this.connected = true;
        };

        this.socket.onmessage = async (event) => {
            const text = await event.data.text();
            const msg = JSON.parse(text);
            this.notifyObservers('received', msg.name, msg.score);
        }
    }

    sendMessage(name, msg) {
        this.notifyObservers('sent', 'me', msg);
        this.socket.send(JSON.stringify({ name, msg }));
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(event, from, msg) {
        this.observers.forEach((h) => h({ event, from, msg }));
        console.log('event: %s \nfrom: %s \nmsg: %s', event, from, msg);
    }
}

export default function App() {
    const location = useLocation();
    const showNavbar = NAVBAR_ROUTES.includes(location.pathname);
    const ws = React.useMemo(() => new webSocketClient(), []);

    const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
    const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
    const [authState, setAuthState] = React.useState(currentAuthState);

    return (
            <div className="body">
                <header id="page-header">
                    <nav className="navbar fixed-top navbar-dark">
                        <h1 className="navbar-brand" href="#">Blackjack</h1>
                    </nav>

                    {showNavbar && <Navbar />}
                </header>

                <Routes>
                    <Route path='/' element={
                        <Login
                            userName={userName}
                            authState={authState}
                            onAuthChange={(userName, authState) => {
                                setAuthState(authState);
                                setUserName(userName);
                            }}
                        />} exact />
                    <Route path='/play' element={<Play userName={userName} websocket={ws}/>} />
                    <Route path='/about' element={<About />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>

                <footer>
                    <br />
                    <span>A site by Weston Chorak</span>
                    <br />
                    <a href="https://github.com/wjchorak/startup">Github</a>
                </footer>
            </div>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}