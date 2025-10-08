import React from 'react';
import './login.css';

export function Login() {
    return (
        <main>
            <div id="login-page">
                <h1>Login</h1>
                <form method="get" action="play">
                    <div>
                        <span>Username</span>
                        <input className="login-enter" type="text" />
                    </div>
                    <br />
                    <div>
                        <span>Password</span>
                        <input className="login-enter" type="password" />
                    </div>
                    <br />
                    <div id="login-controls">
                        <button className="button-outline" type="submit">Login</button>
                        <button className="button-outline" type="submit">Create</button>
                    </div>
                </form>
            </div>
        </main>
    );
}