import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './login.module.css';

export function Authenticated(props) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem('userName');
        localStorage.removeItem('credits');
        props.onLogout();
    }

    return (
        <div className={styles.loginPage}>
            <h1>Logged in as {props.userName}</h1>
            <div className={styles.loggedIn}>
                <button className={`button-outline ${styles.buttonOutline}`} onClick={() => navigate('/play')}>
                    Play
                </button>
                <button className={`button-outline ${styles.buttonOutline}`} onClick={() => logout()}>
                    Logout
                </button>
            </div>
        </div>
    );
}
