import * as fs from 'fs';
import { pathes } from '../pathes';

interface IConfig {

}

const defaultConfig: IConfig = {

}

export class DataService {
    public config: IConfig = defaultConfig;
    public canvas: any | null = null;

    public constructor() {
        this.loadConfig();
        this.loadCanvas();
    }

    public loadCanvas = () => {
        if (!fs.existsSync(pathes.canvasFile)) return;

        const data = fs.readFileSync(pathes.canvasFile, { encoding: 'utf-8' });

        this.config = JSON.parse(data);
    }

    public saveCanvas = () => {
        fs.writeFileSync(pathes.canvasFile, JSON.stringify(this.config));
    }

    public loadConfig = () => {
        if (!fs.existsSync(pathes.configFile)) return;

        const data = fs.readFileSync(pathes.configFile, { encoding: 'utf-8' });

        this.config = JSON.parse(data);
    }

    public saveConfig = () => {
        fs.writeFileSync(pathes.configFile, JSON.stringify(this.config));
    }
}

export const dataService = new DataService();