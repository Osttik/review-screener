import { Point } from "electron";

export class DescriptionReport {
    constructor(
        public text: string,
        public position: Point
    ) {}
}