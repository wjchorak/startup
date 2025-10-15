import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './login.module.css';

export function Authenticated(props) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem('userName');
        props.onLogout();
    }

    return (
        <div className={styles.loginPage}>
            <div className='playerName'>{props.userName}</div>
            <button className={styles.buttonOutline} onClick={() => navigate('/play')}>
                Play
            </button>
            <button variant={styles.buttonOutline} onClick={() => logout()}>
                Logout
            </button>
        </div>
    );
}
