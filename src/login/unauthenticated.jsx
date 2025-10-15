import React from 'react';
import styles from './login.module.css';

import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
    const [userName, setUserName] = React.useState(props.userName);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        localStorage.setItem('userName', userName);
        props.onLogin(userName);
    }

    async function createUser() {
        localStorage.setItem('userName', userName);
        props.onLogin(userName);
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
                        <button className={`button-outline ${styles.buttonOutline}`} onClick={() => loginUser()} disabled={!userName || !password}>Login</button>
                        <button className={`button-outline ${styles.buttonOutline}`} onClick={() => createUser()} disabled={!userName || !password}>Create</button>
                    </div>
                </form>
            </div>

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    );
}
