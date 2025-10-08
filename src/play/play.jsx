import React from 'react';
import './play.css';

export function Play() {
    return (
        <main>
            <div id="leaderboard">
                <table>
                    <tr>
                        <td>
                            <span>Rank</span>
                        </td>
                        <td>
                            <span>Name</span>
                        </td>
                        <td>
                            <span>Score</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>1</span>
                        </td>
                        <td>
                            <span id="player-rank-1">Name</span>
                        </td>
                        <td>
                            <span id="player-score-1">$1135</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>2</span>
                        </td>
                        <td>
                            <span id="player-rank-2">Name</span>
                        </td>
                        <td>
                            <span id="player-score-2">$102</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>3</span>
                        </td>
                            <td>
                            <span id="player-rank-3">Name</span>
                        </td>
                        <td>
                            <span id="player-score-3">$94</span>
                        </td>
                    </tr>
                </table>

                <div id="current-credits">
                    <span id="player-credits">Current Credits: $0</span>
                </div>
            </div>
            
            <div id="game">
                <div class="card-container" id="dealer-cards">
                    <div class="playing-card">K</div>
                </div>

                <div class="card-container" id="player-cards">
                    <div class="playing-card">7</div>
                    <div class="playing-card">10</div>
                </div>

                <div id="controls">
                    <div id="card-controls">
                        <button class="button-outline">Hit</button>
                        <button class="button-outline">Stand</button>
                        <button class="button-outline">x2</button>
                    </div>
            
                    <div id="bet-controls">
                        <button class="button-outline">+</button>
                        <button class="button-outline">-</button>
                        <button class="button-outline">Deal</button>
                    </div>
                </div>
            </div>
            
            <div id="game-state">
                <div id="current-turn">Your Turn...</div>
                <div id="bet">Bet: $30</div>
            </div>
        </main>
    );
}