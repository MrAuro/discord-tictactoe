import path from 'path';
import fs from 'fs';
import Config from './Config';

/**
 * Manages the configuration loading to operate the bot.
 * Loads values from a static file and environement variables.
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class ConfigProvider implements Config {
    public clientId = '';
    public token = '';
    public language = 'en';
    public command = '!ttt';

    [key: string]: any;

    private readonly CONFIG_PATH = path.join(process.cwd(), 'config', 'config.json');

    constructor() {
        this.initializeFromFile();
        this.initializeFromEnv();
        this.verifyValues();
    }

    private initializeFromFile(): void {
        if (fs.existsSync(this.CONFIG_PATH)) {
            const savedConfig = require(this.CONFIG_PATH);
            Object.keys(savedConfig).forEach(field => {
                this[field] = savedConfig[field];
            });
        }
    }

    private initializeFromEnv(): void {
        Object.keys(process.env)
            .filter(key => this[ConfigProvider.camelCase(key)] !== undefined)
            .forEach(key => {
                const camelCaseKey = ConfigProvider.camelCase(key);
                const value: string = process.env[key]!;
                let newValue;

                // Ignore the default Node variable LANGUAGE
                if (camelCaseKey === 'language') return;
                /*if (camelCaseKey === 'language' && value.indexOf('_') > 0) {
                    value = value.split('_')[0];
                }*/

                // Operate types checking
                switch (typeof this[camelCaseKey]) {
                    case 'string':
                    case 'object':
                    default:
                        newValue = value.toString();
                        break;
                    case 'number':
                        newValue = parseFloat(value);
                        break;
                    case 'boolean':
                        newValue = value.toLowerCase() === 'true';
                        break;
                }

                this[camelCaseKey] = newValue;
            });
    }

    private verifyValues(): void {
        const emptyKey = Object.keys(this).find(key => this[key] === '');
        if (emptyKey) {
            throw new Error(`Config key ${emptyKey} must be defined`);
        }
    }

    private static camelCase(str: string): string {
        return str.toLowerCase().replace(/_([a-z])/g, g => {
            return g[1].toUpperCase();
        });
    }
}
