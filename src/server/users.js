import { User } from './database.js';
import bodyParser from 'body-parser';
import session from 'express-session';
import { Sequelize } from 'sequelize';

export default function(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 3600 * 24
        }
    }));

    app.use(bodyParser.json());

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findByPk(username);
        if(!user) {
            return res.status(404).json({error: 'User does not exist'});
        }

        if(!user.authenticate(password)) {
            return res.status(401).json({error: 'Wrong password'});
        }

        req.session.username = username;
        return res.status(200).json({message: 'Authenticated!'});
    });

    app.post('/logout', (req, res) => {
        req.session.destroy();
        return res.status(204);
    });

    app.post('/users', async (req, res) => {
        const { username, password } = req.body;
        if(await User.findByPk(username)) {
            return res.status(409).json({error: 'Username already exists'});
        }

        await User.create({ username, password });
        const url = '/users/' + encodeURIComponent(username);
        return res.status(201).header('Location', url).json({created: url});
    });

    app.get('/users', async (req, res) => {
        const users = (await User.findAll()).sort((a, b) => (b.winsChaser + b.winsRunner) - (a.winsChaser + a.winsRunner));

        return res.json(users.map(user => ({
            username: user.username,
            winsChaser: user.winsChaser,
            winsRunner: user.winsRunner
        })));
    });

    app.get('/users/:username', async (req, res) => {
        const user = await User.findByPk(req.params.username);

        if(!user) {
            return res.status(404);
        }

        return res.json({
            username: user.username,
            winsChaser: user.winsChaser,
            winsRunner: user.winsRunner
        });
    });

    app.put('/users/:username/password', (req, res) => {
        // TODO implement password reset
        return res.status(501).json({error: 'Not implemented'});
    });

    app.delete('/users/:username', async (req, res) => {
        const user = await User.findByPk(req.params.username);

        if(!user) {
            return res.status(404);
        }

        const { username, password } = req.body;

        if(!user.authenticate(password)) {
            return res.status(401).json({error: 'Wrong password'});
        }

        user.destroy();

        return res.status(204);
    });
}
