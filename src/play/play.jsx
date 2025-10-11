import React, { useEffect, useState } from 'react';
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
    for (let suit of suits) {
        for (let {value, display}  of values) {
            deck.push({id: `${display}${suit}`, value, display, suit});
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

    let animatedCard = {...card, isNew: true};

    setDeck(newDeck);
    setHand(hand => [...hand, animatedCard]);

    setTimeout(() => {
        setHand(prev =>
            prev.map(c => (c.id === animatedCard.id ? { ...c, isNew: false } : c))
        );
    }, 500);
}

function calculateScore(hand) {
    let aceCount = 0;
    let score = 0;

    for (let card of hand) {
        score += card.value;
        console.log("Card:", card.display, card.suit, "Value:", card.value);
        if (card.value === 11) aceCount += 1;

        if(score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
    }

    return score;
}

function hit(deck, setDeck, setHand) {
    drawCard(deck, setDeck, setHand);
}

export function Play() {
    const [deck, setDeck] = useState(() => getNewDeck());
    const [dealerHand, setDealerHand] = useState([]);
    const [dealerScore, setDealerScore] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState([]);
    const [gameState, setGameState] = useState(1);

    useEffect(() => {
        let currentScore = calculateScore(playerHand);
        setPlayerScore(currentScore);

        if (currentScore > 20) {
            currentScore === 21 ? setPlayerScore("Blackjack!") : setPlayerScore("Bust!");
            setGameState(2);
        }
    }, [playerHand]);

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
                    {dealerHand.map((card, index) => {
                        const cardClasses = `${styles.playingCard} ${card.isNew ? styles.dealingCard : ''}`;

                        return (
                            <div key={card.id} className={cardClasses}>
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
                        );
                    })}
                </div>

                <div className='styles.dealer-score'>Dealer Score: {dealerScore}</div>

                <div className={styles.cardContainer} id="player-cards">
                    {playerHand.map((card, index) => {
                        const cardClasses = `${styles.playingCard} ${card.isNew ? styles.dealingCard : ''}`;

                        return (
                            <div key={card.id} className={cardClasses}>
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
                        );
                    })}
                </div>

                <div className='styles.player-score'>Player Score: {playerScore}</div>

                <div id="controls">
                    {gameState === 1 ? (
                        <div id="card-controls">
                            <button className="button-outline" onClick={() => hit(deck, setDeck, setPlayerHand)}>Hit</button>
                            <button className="button-outline">Stand</button>
                            <button className="button-outline">x2</button>
                        </div>
                    ) : (
                        <div id="bet-controls">
                            <button className="button-outline">+</button>
                            <button className="button-outline">-</button>
                            <button className="button-outline">Deal</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className={styles.gameState} id="game-state">
                <div id="current-turn">Your Turn...</div>
                <div id="bet">Bet: $30</div>
            </div>
        </main>
    );
}