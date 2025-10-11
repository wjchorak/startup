import React, { useState } from 'react';
import styles from './play.module.css';

const suits = ['♥', '♠', '♣', '♦'];
const values = [
    { value: 11,  display: 'A' },
    { value: 2,  display: '2' },
    { value: 3,  display: '3' },
    { value: 4,  display: '4' },
    { value: 5,  display: '5' },
    { value: 6,  display: '6' },
    { value: 7,  display: '7' },
    { value: 8,  display: '8' },
    { value: 9,  display: '9' },
    { value: 10,  display: '10' },
    { value: 10,  display: 'J' },
    { value: 10,  display: 'Q' },
    { value: 10,  display: 'K' }
];

function getNewDeck() {
    let deck = [];
    for (const suit of suits) {
        for (const {value, display}  of values) {
            deck.push({value, display, suit});
        }
    }

    for (let i = deck.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function drawCard(deck, setDeck, setHand) {
    if (deck.length === 0) {
        console.log("Error: out of cards :(");
        return null;
    }

    let newDeck = [...deck];
    let card = newDeck.pop();

    setDeck(newDeck);
    setHand(hand => [...hand, card]);
}

export function Play() {
    const [deck, setDeck] = useState(() => getNewDeck());
    const [dealerHand, setDealerHand] = useState([]);

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
                    {dealerHand.map((card, index) => (
                        <div key={index} className={styles.playingCard}>
                            <div className={styles.cornerTop}>
                                {card.display} {card.suit}
                            </div>
                            <div className={styles.centerValue}>
                                {card.display === 'A' ? card.suit : card.display}
                            </div>
                            <div className={styles.cornerBottom}>
                                {card.display} {card.suit}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.cardContainer} id="player-cards">
                    <div className={styles.playingCard}>7</div>
                    <div className={styles.playingCard}>10</div>
                </div>

                <div id="controls">
                    <div id="card-controls">
                        <button className="button-outline" onClick={() => drawCard(deck, setDeck, setDealerHand)}>Hit</button>
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