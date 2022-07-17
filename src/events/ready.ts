import SlydoBot from "../structures/SlydoBot";

export default {
    // name of event
    name: "ready",
    once: true,

    // executed when event is fired
    execute: async(client: SlydoBot) => {
        console.log("Bot is ready!");
    }
};