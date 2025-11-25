import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import DB from './database.js';
import peerProxy from './peerProxy.js';

const app = express();

const authCookieName = 'token';


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

    DB.replenishCredits();

    global.lastReset = today;
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
            await DB.updateUser(user);
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
        DB.updateUser(user);
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
apiRouter.get('/credits', verifyAuth, async (_req, res) => {
    const credits = await DB.getCredits();
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
        await DB.updateUser(user);
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
async function updateCredits(newCredits) {
    await DB.updateCredits(newCredits);
    return DB.getCredits();
}

async function createUser(userName, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        userName: userName,
        password: passwordHash,
        credits: 20,
        token: uuidv4(),
    };
    await DB.addUser(user);

    return user;
}

async function findUser(field, value) {
    if (!value) return null;

    if (field === 'token') {
        return DB.getUserByToken(value);
    }
    return DB.getUser(value);
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

const httpService = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

peerProxy(httpService);