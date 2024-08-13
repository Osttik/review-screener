import { Point } from "electron";
import { DescriptionReport } from "./descriptionReport";

export class ImageReport {
    constructor(
        public url: string,
        public point: Point,
        public descriptions: DescriptionReport[] = []
    ) {}
}