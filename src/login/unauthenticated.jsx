import React from 'react';
import styles from './login.module.css';

import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
    const [userName, setUserName] = React.useState(props.userName);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        loginOrCreate(`/api/auth/login`);
    }

    async function createUser() {
        loginOrCreate(`/api/auth/create`);
    }

    async function loginOrCreate(endpoint) {
        const response = await fetch(endpoint, {
            method: 'post',
            body: JSON.stringify({ userName: userName, password: password }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (response?.status === 200) {
            localStorage.setItem('userName', userName);
            props.onLogin(userName);
        } else {
            const body = await response.json();
            setDisplayError(`⚠ Error: ${body.msg}`);
        }
    }

    return (
        <>
            <div className={styles.loginPage}>
                <h1>Login</h1>
                <form method="get" action="play">
                    <div>
                        <span>Username</span>
                        <input className={`form-control ${styles.loginEnter}`} type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder='your@email.com' />
                    </div>
                    <br />
                    <div>
                        <span>Password</span>
                        <input className={`form-control ${styles.loginEnter}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' />
                    </div>
                    <br />
                    <div className={styles.loginControls}>
                        <button className={`button-outline ${styles.buttonOutline}`} onClick={(e) => { e.preventDefault(); loginUser(); }} disabled={!userName || !password}>Login</button>
                        <button className={`button-outline ${styles.buttonOutline}`} onClick={(e) => { e.preventDefault(); createUser(); }} disabled={!userName || !password}>Create</button>
                    </div>
                </form>
            </div>

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    );
}
