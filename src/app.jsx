import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
    return (
        <div className="body">
            <header>
                <nav class="navbar fixed-top navbar-dark">
                    <h1 class="navbar-brand" href="#">Blackjack</h1>
                </nav>
            </header>

            <main>App components go here</main>

            <footer>
                <br />
                <span>A site by Weston Chorak</span>
                <br />
                <a href="https://github.com/wjchorak/startup">Github</a>
            </footer>
        </div>
    );
}