import { sequelize } from "../../src/structures/database";
import { INTEGER, STRING, Model, where, BOOLEAN } from "sequelize";
import { TriviaBase } from "./Trivia";

// I'll do better later.
const triviaInfoTable = sequelize.define("triviaDb", {
    triviaId: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true
    },
    answer: {
        type: INTEGER,
        allowNull: false
    },
    wonCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    lostCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    responseIds: {
        type: STRING,
        get() {
            return this.getDataValue('responseIds')?.split(';') ?? [];
        },
        set(val: string) {
            this.setDataValue('responseIds', [...(this.getDataValue('responseIds')?.split(';') ?? []), val].join(';'));
        }
    },
    triviaMessage: {
        type: STRING
    },
    ended: {
        type: INTEGER,
        allowNull: true
    }
}, { timestamps: false });

const triviaUserStatsTable = sequelize.define("triviaUserStatsDb", {
    userId: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    wonCount: {
        type: INTEGER,
        allowNull: false
    },
    responsesCount: {
        type: INTEGER,
        allowNull: false
    }
}, { timestamps: false });

const sync = Promise.all([triviaInfoTable.sync(), triviaUserStatsTable.sync()]);

export default {
    createTrivia: async(answer: number): Promise<number> => {
        await sync;

        const instance = await triviaInfoTable.create({ answer });
        return instance.getDataValue("triviaId") as number;
    },

    getAllTrivia: async(): Promise<TriviaBase[]> => {
        await sync;

        const instances = await triviaInfoTable.findAll();
        return instances.map((instance) => {
            const trivia = new TriviaBase({
                isRestoration: true,
                answer: instance.getDataValue("answer"),
                responseIds: (instance as any).responseIds
            });

            trivia.messageReferred = instance.getDataValue("triviaMessage");
            return trivia;
        });
    },

    updateMessageReference: async(triviaId: number, messageReferred: string): Promise<void> => {
        await sync;
        await triviaInfoTable.update({ triviaMessage: messageReferred }, { where: { triviaId } });
    },

    updateUserTrivia: async(userId: string, triviaId: number, won: boolean): Promise<void> => {
        await sync;

        const instance = await triviaInfoTable.findOne({ where: { triviaId } });

        if (!instance) {
            throw new Error(`No trivia with id ${triviaId} found`);
        }

        instance.update({ responseIds: userId });
        won === true ? instance.increment("wonCount") : instance.increment("lostCount");

        const [userStats, isNew] = await triviaUserStatsTable.findOrCreate({ where: { userId }, defaults: { wonCount: 0, responsesCount: 0 } });

        !won ?? userStats.increment("wonCount");
        userStats.increment("responsesCount");
    },

    getUserStats: async(userId: string): Promise<{ won: number, lost: number }> => {
        await sync;

        const userStats = await triviaUserStatsTable.findOne({ where: { userId } });

        return {
            won: userStats?.getDataValue("wonCount") ?? 0,
            lost: userStats?.getDataValue("responsesCount") - userStats?.getDataValue("wonCount") ?? 0
        };
    },

    endTrivia: async(triviaId: number): Promise<number> => {
        await sync;

        const endTime = Math.floor(new Date().getTime() / 1000);
        await triviaInfoTable.update({ ended: endTime }, { where: { triviaId } });
        return endTime;
    }
};