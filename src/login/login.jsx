import React from 'react';
import styles from './login.module.css';

export function Login() {
    return (
        <main className={styles.main}>
            <div className={styles.loginPage}>
                <h1>Login</h1>
                <form method="get" action="play">
                    <div>
                        <span>Username</span>
                        <input className={styles.loginEnter} type="text" />
                    </div>
                    <br />
                    <div>
                        <span>Password</span>
                        <input className={styles.loginEnter} type="password" />
                    </div>
                    <br />
                    <div className={styles.loginControls}>
                        <button className={`button-outline ${styles.buttonOutline}`} type="submit">Login</button>
                        <button className={`button-outline ${styles.buttonOutline}`} type="submit">Create</button>
                    </div>
                </form>
            </div>
        </main>
    );
}