import React from 'react';
import styles from './play.module.css';

export function Play() {
    return (
        <main className={styles.main}>
            <div className={styles.leaderboard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <td><span>Rank</span></td>
                            <td><span>Name</span></td>
                            <td><span>Score</span></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span>1</span></td>
                            <td><span id="player-rank-1">Name</span></td>
                            <td><span id="player-score-1">$1135</span></td>
                        </tr>
                        <tr>
                            <td><span>2</span></td>
                            <td><span id="player-rank-2">Name</span></td>
                            <td><span id="player-score-2">$102</span></td>
                        </tr>
                        <tr>
                            <td><span>3</span></td>
                            <td><span id="player-rank-3">Name</span></td>
                            <td><span id="player-score-3">$94</span></td>
                        </tr>
                    </tbody>
                </table>

                <div className={styles.currentCredits}>
                    <span className={styles.playerCredits} id="player-credits">
                        Current Credits: $0
                    </span>
                </div>
            </div>
            
            <div className={styles.game}>
                <div className={styles.cardContainer} id="dealer-cards">
                    <div className={styles.playingCard}>K</div>
                </div>

                <div className={styles.cardContainer} id="player-cards">
                    <div className={styles.playingCard}>7</div>
                    <div className={styles.playingCard}>10</div>
                </div>

                <div id="controls">
                    <div id="card-controls">
                        <button className="button-outline">Hit</button>
                        <button className="button-outline">Stand</button>
                        <button className="button-outline">x2</button>
                    </div>
            
                    <div id="bet-controls">
                        <button className="button-outline">+</button>
                        <button className="button-outline">-</button>
                        <button className="button-outline">Deal</button>
                    </div>
                </div>
            </div>
            
            <div className={styles.gameState} id="game-state">
                <div id="current-turn">Your Turn...</div>
                <div id="bet">Bet: $30</div>
            </div>
        </main>
    );
}