export type PluginEvents = 'load' | 'onCommandsDeployment' | 'onSubscribeEvents' | 'onRegisterCommands';

export interface PluginBase { 
    name: string,
    version: string,
    invokeEvent: (eventName: PluginEvents, args: any[]) => void; 
}
