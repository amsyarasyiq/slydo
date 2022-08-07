import { sequelize } from "../../src/structures/database";
import { INTEGER, STRING, Model, where, BOOLEAN } from "sequelize";

// I'll do better later.
const triviaTableID = sequelize.define("triviaIdDb", {
    triviaId: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    ended: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { timestamps: false });

const triviaUserTable = sequelize.define("triviaUserDb", {
    userId: {
        type: STRING,
        allowNull: false
    },
    triviaId: {
        type: INTEGER,
        allowNull: false,
        unique: true
    },
    won: {
        type: BOOLEAN,
        allowNull: false
    },
    lost: {
        type: BOOLEAN,
        allowNull: false,
    }
}, { timestamps: false });

const sync = Promise.all([triviaTableID.sync(), triviaUserTable.sync()]);

export default {
    createNewTriviaId: async(): Promise<number> => {
        await sync;
        const instance = await triviaTableID.create();
        return instance.getDataValue("triviaId") as number;
    },

    updateUserTrivia: async(userId: string, triviaId: number, won: boolean): Promise<void> => {
        await sync;
        await triviaUserTable.create({
            userId, triviaId, won, lost: !won
        });
    },

    getUserStats: async(userId: string): Promise<{ won: number, lost: number }> => {
        await sync;
        
        let won: number = 0, lost: number = 0;
        const instance = await triviaUserTable.findAll({
            where: { userId }
        });

        instance.forEach(element => {
            won += element.getDataValue("won") as number;
            lost += element.getDataValue("lost") as number;
        });

        return { won, lost };
    },

    endTrivia: async(triviaId: number): Promise<void> => {
        await sync;
        await triviaTableID.update({ ended: true }, { where: { triviaId } });
    }
};