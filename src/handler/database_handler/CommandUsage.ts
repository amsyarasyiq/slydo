import { INTEGER, STRING, Model } from "sequelize";
import { sequelize } from "../../structures/database";

const table = sequelize.define("slashCommandUses", {
    commandName: {
        type: STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    count: {
        type: INTEGER,
        allowNull: false,
    }
}, { timestamps: false });

const sync: Promise<any> = table.sync();

const getInstance = async(commandName: string): Promise<Model<any, any>> => {
    await sync;
    const [instance, isNew] = await table.findOrCreate({ 
        where: { commandName }, 
        defaults: { commandName, count: 0 }
    });

    return instance;
};

export default {
    getUsageCount: async(commandName: string): Promise<number> => {
        let instance = await getInstance(commandName);
        return instance.getDataValue("count") as number;
    },
    increaseUsageCount: async(commandName: string): Promise<void> => {
        let instance = await getInstance(commandName);
        await instance.increment('count');
    }
};


