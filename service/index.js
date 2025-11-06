import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const authCookieName = 'token';

let users = [];
let credits = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());

app.use(cookieParser());

app.use(express.static('public'));

var apiRouter = express.Router();
app.use('/api', apiRouter);

// These next three are for the daily credit replenish, where users with $0 get 20 at the new day
// I didn't time it to midnight, but I'll be pushing changes at night, so that's a good enough lazy solution

replenishDailyCredits();

setInterval(replenishDailyCredits, 24 * 60 * 60 * 1000);

function replenishDailyCredits() {
    const today = new Date().toDateString();

    if (global.lastReset === today) {
        return;
    }

    users.forEach(user => {
        if (user.credits <= 0) {
            user.credits = 20;
        }
    });

    global.lastReset = today;
    console.log("Daily credits replenished for users at 0");
}

// THESE ENDPOINTS ARE MOSTLY COPIED/ADAPTED FROM SIMON CODE

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
    if (await findUser('userName', req.body.userName)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await createUser(req.body.userName, req.body.password);

        setAuthCookie(res, user.token);
        res.send({ userName: user.userName });
    }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
    const user = await findUser('userName', req.body.userName);
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            user.token = uuidv4();
            setAuthCookie(res, user.token);
            res.send({ userName: user.userName });
            return;
        }
    }
    res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        delete user.token;
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
};

// GetCredits
apiRouter.get('/credits', verifyAuth, (_req, res) => {
    res.send(credits);
});

// SubmitCredits
apiRouter.post('/credits', verifyAuth, (req, res) => {
    credits = updateCredits(req.body);
    res.send(credits);
});

// GetUserCredits
apiRouter.get('/usercredits', verifyAuth, async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);

    if(user) {
        res.json({ credits: user.credits });
    }
});

// SubmitUserCredits
apiRouter.post('/usercredits', verifyAuth, async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user && typeof req.body.credits === 'number') {
        user.credits = req.body.credits;
        res.send({ credits: user.credits });
    } else {
        res.status(400).send({ msg: 'Invalid credit value' });
    }
});

// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// updateCredits considers a new credit score for inclusion in the high credits/score list.
function updateCredits(newCredits) {
    credits = credits.filter(c => c.name != newCredits.name);

    let found = false;
    for (const [i, prevCredits] of credits.entries()) {
        if (newCredits.credits > prevCredits.credits) {
            credits.splice(i, 0, newCredits);
            found = true;
            break;
        }
    }

    if (!found) {
        credits.push(newCredits);
    }

    if (credits.length > 3) {
        credits.length = 3;
    }

    return credits;
}

async function createUser(userName, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        userName: userName,
        password: passwordHash,
        credits: 20,
        token: uuidv4(),
    };
    users.push(user);

    return user;
}

async function findUser(field, value) {
    if (!value) return null;

    return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});