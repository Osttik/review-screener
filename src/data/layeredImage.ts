export class LinePixel {
    public constructor(
        public color: string, 
        public lineId: string
    ) {}
}

export class Pixel {
    public constructor(
        public x: number,
        public y: number,
        public linesPixels: LinePixel[] = []
    ) {}

    public isEmpty = () => this.linesPixels.length === 0;
    public getLast = () => this.linesPixels[this.linesPixels.length - 1];
}

export default class LayeredImage {
    public constructor(
        public matrix: Pixel[][] = []
    ) {}
}