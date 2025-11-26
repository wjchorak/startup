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

    let animatedCard;

    setDeck(prevDeck => {
        let newDeck = [...prevDeck];
        let card = newDeck.pop();

        animatedCard = { ...card, isNew: true };

        setHand(prevHand => [...prevHand, animatedCard]);

        return newDeck;
    });

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

        if (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
    }

    return score;
}

async function updateLeaderboard(name, credits, setLeaderboard) {
    console.log("Leaderboard updating " + name + " $" + credits + "...")

    let newScore = { name: name, credits: credits };

    await fetch('/api/credits', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newScore),
    });

    fetch('/api/credits')
        .then((response) => response.json())
        .then((updated) => {
            setLeaderboard(updated);
        });
}


function hit(deck, setDeck, setHand) {
    drawCard(deck, setDeck, setHand);
}

function doubleDown(credits, setCredits, bet, setBet, deck, setDeck, setHand, setGameState) {
    if(credits >= bet) {
        setCredits(credits - bet);
        setBet(bet * 2);
        drawCard(deck, setDeck, setHand);
        setGameState(4);
    }
}

function changeBet(max, bet, setBet, adding) {
    let newBet = bet;
    adding ? newBet++ : newBet--;

    if(newBet < 1) { newBet = 1; 
    } else if(newBet > max) { newBet = max; }

    setBet(newBet);
}

async function syncUserCredits(credits) {
    try {
        await fetch('/api/usercredits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credits }),
        });
    } catch (err) {
        console.error('Error updating user credits:', err);
    }
}

export function Play({ userName, websocket }) {
    const [deck, setDeck] = useState(() => getNewDeck());
    const [dealerHand, setDealerHand] = useState([]);
    const [dealerScore, setDealerScore] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameState, setGameState] = useState(1);
    const [gameOver, setGameOver] = useState(true);
    const [stateText, setStateText] = useState();
    const [bet, setBet] = useState(1);

    const [credits, setCredits] = useState();

    useEffect(() => {
        fetch('/api/usercredits')
            .then(res => res.json())
            .then(data => setCredits(data.credits))
            .catch(err => console.error('Error fetching credits:', err));
    }, []);

    useEffect(() => {
        fetch('/api/credits')
            .then(res => res.json())
            .then(data => setLeaderboard(data))
            .catch(err => console.error('Error fetching leaderboard:', err));
    }, []);

    useEffect(() => {
        const handler = ({ event, from, msg }) => {
            if(event === 'received') {
                fetch('/api/credits')
                    .then((response) => response.json())
                    .then((updated) => {
                        setLeaderboard(updated);
                    });
            }
        };

        websocket.addObserver(handler);

        return () => {
            websocket.observers = websocket.observers.filter(h => h !== handler);
        }

    }, [websocket]);



    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function broadcastGameResult() {
        if (!websocket) return;

        websocket.sendMessage(userName, {
            time: Date.now()
        });
    }


    const dealerTurn = async () => {
        let currentDealerHand = [...dealerHand];
        let currentDeck = [...deck];
        let currentPlayerScore = calculateScore(playerHand);

        while (true) {
            currentDealerHand = currentDealerHand.map(c => ({ ...c, isNew: false }));
            await delay(50);

            let currentScore = calculateScore(currentDealerHand);

            console.log("Current Score: " + currentScore);

            if (currentScore > 21 && currentPlayerScore <= 21) {
                setStateText("Dealer Busts, " + userName + " Wins!");
                setDealerHand(currentDealerHand);
                setCredits(credits + (2 * bet));
                setGameState(1);
                updateLeaderboard(userName, credits + (2 * bet), setLeaderboard);
                syncUserCredits(credits + (2 * bet));
                setGameOver(true);
                broadcastGameResult();
                return;
            } else if (currentScore > 21 && currentPlayerScore > 21) {
                setStateText("Push. Bet Returned.");
                setDealerHand(currentDealerHand);
                setCredits(credits + (bet));
                setGameState(1);
                updateLeaderboard(userName, credits + (bet), setLeaderboard);
                syncUserCredits(credits + (bet));
                setGameOver(true);
                broadcastGameResult();
                return;
            } else if (currentScore === 21 && currentPlayerScore === 21) {
                setStateText("Push. Bet Returned.");
                setDealerHand(currentDealerHand);
                setCredits(credits + (bet));
                setGameState(1);
                updateLeaderboard(userName, credits + (bet), setLeaderboard);
                syncUserCredits(credits + (bet));
                setGameOver(true);
                broadcastGameResult();
                return;
            } else if (currentScore === 21) {
                setStateText("Dealer Wins.");
                setDealerHand(currentDealerHand);
                setGameState(1);
                updateLeaderboard(userName, credits, setLeaderboard);
                syncUserCredits(credits);
                setGameOver(true);
                broadcastGameResult();
                return;
            }

            if (currentScore >= 17) {
                if (currentScore === currentPlayerScore) {
                    setStateText("Push. Bet Returned.");
                    setCredits(credits + (bet));
                    updateLeaderboard(userName, credits + (bet), setLeaderboard);
                    syncUserCredits(credits + (bet));
                } else if ((currentScore > currentPlayerScore) || currentPlayerScore > 21) {
                    setStateText("Dealer Wins.");
                    updateLeaderboard(userName, credits, setLeaderboard);
                    syncUserCredits(credits);
                } else {
                    setStateText(userName + " Wins!");
                    setCredits(credits + (2 * bet));
                    updateLeaderboard(userName, credits + (2 * bet), setLeaderboard);
                    syncUserCredits(credits + (2 * bet));
                }
                setDealerHand(currentDealerHand);
                setGameState(1);
                setGameOver(true);
                broadcastGameResult();
                return;
            }

            await delay(1000);

            const card = currentDeck.pop();
            const animatedCard = { ...card, isNew: true };

            currentDealerHand = [...currentDealerHand, animatedCard];
            setDeck([...currentDeck]);
            setDealerHand(currentDealerHand);

            console.log(currentDealerHand);

            await delay(500);
        }
    };

    useEffect(() => {
        let currentScore = calculateScore(playerHand);
        setPlayerScore(currentScore);

        if (currentScore > 20) {
            if (playerHand.length === 2 && currentScore === 21) {
                setPlayerScore("Blackjack!");
            }
            if (currentScore > 21) {
                setPlayerScore("Bust!");
            }
            setGameState(4);
        }
    }, [playerHand]);

    useEffect(() => {
        let currentScore = calculateScore(dealerHand);
        setDealerScore(currentScore);

        if (currentScore > 20) {
            if (dealerHand.length === 2 && currentScore === 21) {
                setDealerScore("Blackjack!");
            }
            if (currentScore > 21) {
                setDealerScore("Bust!");
            }
        }
    }, [dealerHand]);

    useEffect(() => {
        switch (gameState) {
            case 1:
                break;
            case 2:
                setDeck(() => getNewDeck());
                setDealerHand([]);
                console.log(dealerHand);
                setPlayerHand([]);
                setBet(1);
                setStateText("Make a bet...");
                break;
            case 3:
                hit(deck, setDeck, setPlayerHand);
                hit(deck, setDeck, setPlayerHand);
                hit(deck, setDeck, setDealerHand);

                setCredits(credits - bet);
                
                setStateText("Your turn...");
                break;
            case 4:
                setStateText("Dealer turn...");
                dealerTurn();
                setGameState(1);
                break;
            default:
                console.log("Error: incorrect gameState ", gameState);
        }
    }, [gameState]);

    useEffect(() => {
        if(credits != undefined && credits != null) {
            updateLeaderboard(userName, credits, setLeaderboard);
        }
    }, []);


    return (
        <main className={styles.main}>
            <div className={styles.leaderboard}>
                <table className={styles.table}>
                    <tbody>
                        {leaderboard.map((player, index) => (
                            <tr key={player.name}>
                                <td><span>{index + 1}</span></td>
                                <td><span>{player.name}</span></td>
                                <td><span>${player.credits}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.currentCredits}>
                    <span className={styles.playerCredits} id="player-credits">
                        Current Credits: ${credits}
                    </span>
                </div>
            </div>
            
            <div className={styles.game}>
                <div className={styles.cardContainer} id="dealer-cards">
                    {dealerHand.map((card, index) => {
                        const cardClasses = `${styles.playingCard} ${card.isNew ? styles.dealingCard : ''}`;
                        const colorClass = (card.suit === '♥' || card.suit === '♦') ? styles.red : styles.black;

                        return (
                            <div key={card.id} className={`${cardClasses} ${colorClass}`}>
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
                        const colorClass = (card.suit === '♥' || card.suit === '♦') ? styles.red : styles.black;

                        return (
                            <div key={card.id} className={`${cardClasses} ${colorClass}`}>
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
                    {(() => {
                        switch (gameState) {
                            case 1:
                                return <div id="game-controls">
                                    {gameOver && credits > 0 && (<button className="button-outline" onClick={() => { setGameState(2); setGameOver(false); }}>New Game</button>)}
                                </div>;
                            case 2:
                                return <div id="bet-controls">
                                    <button className="button-outline" onClick={() => changeBet(credits, bet, setBet, true)}>+</button>
                                    <button className="button-outline" onClick={() => changeBet(credits, bet, setBet, false)}>-</button>
                                    <button className="button-outline" onClick={() => setGameState(3)}>Deal</button>
                                </div>;
                            case 3:
                                return <div id="card-controls">
                                    <button className="button-outline" onClick={() => hit(deck, setDeck, setPlayerHand)}>Hit</button>
                                    <button className="button-outline" onClick={() => setGameState(4)}>Stand</button>
                                    <button className="button-outline" onClick={() => doubleDown(credits, setCredits, bet, setBet, deck, setDeck, setPlayerHand, setGameState)}>x2</button>
                                </div>;
                            case 4:
                                return <div id="gameControls"></div>;
                            default:
                                return null;
                        }
                    })()}
                </div>
            </div>
            
            <div className={styles.gameState} id="game-state">
                <div id="current-turn">{stateText}</div>
                {gameOver && credits === 0 && (<div id="bet">You're out of credits. Better luck tomorrow!</div>)}
                {gameOver === false && (<div id="bet">Bet: ${bet}</div>)}
            </div>
        </main>
    );
}