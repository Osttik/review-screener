import path from "path";

export const TEMPORARY_SCREESHOT_FOLDER = "screenshots_tmp";
export const IMAGES_FOLDER = "images";
export const REPORTS_FOLDER = "reports";

export class Pathes {
    constructor(public mainProcessDirectory: string) {}

    public get temporaryScreenshotsFolder() {
        return path.join(this.mainProcessDirectory, TEMPORARY_SCREESHOT_FOLDER);
    }

    public get imagesFolder() {
        return path.join(this.mainProcessDirectory, IMAGES_FOLDER);
    }

    public get reportsFolder() {
        return path.join(this.mainProcessDirectory, REPORTS_FOLDER);
    }
}

export const pathes = new Pathes(__dirname);