import { md } from "node-forge";
export interface IPrizes {
    prizes: string[];
    moderno: string;
    rio: string;
    salteado: string;
    refund: string;
    all?: string[];
}
const Sha512 = md.sha512;
export class PrizesService {
    private prizes: string[];
    private hash: string;
    private prevDrawHash: string;
    public drawHash: string;
    init(hash: string, prevDrawHash: string): IPrizes {
        this.hash = hash;
        this.prevDrawHash = prevDrawHash;
        this.drawHash = this.generateHash();
        this.prizes = this.extract();
        return this.parse;
    }
    get parse(): IPrizes {
        const moderno = this.getModern();
        const rio = this.getRio();
        const salteado = this.getGrupoSalteado();
        const refund = this.getRefund();
        return {
            prizes: this.prizes,
            moderno: moderno,
            rio: rio,
            salteado: salteado.toString(),
            refund: refund,
            all: [...this.prizes, moderno, rio, salteado.toString(), refund]
        };
    }
    private generateHash(): string {
        const sha512 = Sha512.create();
        sha512.update(`${this.hash}${this.prevDrawHash}`);
        return sha512.digest().toHex();
    }
    private extract(): string[] {
        const extractNumbersOfString = (str: string) => str.replace(/\D/g, "");
        const stripped: string = extractNumbersOfString(this.drawHash);
        const draw: string = stripped.substr(0, 20);
        return [
            draw.substr(0, 4),
            draw.substr(4, 4),
            draw.substr(8, 4),
            draw.substr(12, 4),
            draw.substr(16, 4)
        ];
    }
    private getModern(): string {
        const value = this.prizes
            .reduce((a, p) => a + Number(p), 0)
            .toString()
            .substr(-4);
        return value.padStart(4, "0");
    }
    private getRio(): string {
        const values = this.prizes.slice(0, 2);
        let mult = values.reduce((a, b) => a * Number(b), 1).toString();
        mult.length < 6 && (mult = mult.padStart(6, "0"));
        return mult.substr(-6).substr(0, 3);
    }
    private getGrupoSalteado(): number {
        const prize: string = this.prizes[0];
        const decena: number = +prize.substr(-2);
        const number = decena * 4;
        const last2digit = number.toString().padStart(4, "0");
        return this.getPrizeGroup(last2digit);
    }
    private getRefund(): string {
        const suma = this.prizes.reduce((acum, n) => acum + +n, 0);
        return (suma % 10).toString();
    }
    private getPrizeGroup(prize: number | string) {
        const last2digits = prize.toString().slice(-2);
        return last2digits == "00"
            ? 25
            : Number(last2digits) % 4 == 0
                ? Number(last2digits) / 4
                : Math.floor(Number(last2digits) / 4) + 1;
    }
    set Prizes(prizes) {
        this.prizes = prizes
    }
}