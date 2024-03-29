import { PluginBase } from "../structures/PluginBase";

const registeredSelectMenu: { [key: string]: string } = {};

export const getUniqueSelectId = (plugin: PluginBase): string => {
    const uniqueId = `${plugin.name}:${Math.random().toString(36).substring(2, 15)}}`;
    plugin.selectMenuIds.push(uniqueId);
    return uniqueId;
};