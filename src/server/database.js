'use strict';

import { Sequelize, DataTypes } from 'sequelize';
import useBcrypt from 'sequelize-bcrypt';

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './db.sqlite' // Relative to where you're running this from (project root most probably), not src/server/
});

export const User = database.define('User', {
    username: { type: DataTypes.STRING, primaryKey: true },
    password: { type: DataTypes.STRING },
});

useBcrypt(User); // Automatically hashes `password` and adds User.authenticate()

database.sync();
