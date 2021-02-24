"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrizesService = void 0;
const forge = require("node-forge");
const Sha512 = forge.md.sha512;
class PrizesService {
    init(hash, prevDrawHash) {
        this.hash = hash;
        this.prevDrawHash = prevDrawHash;
        this.drawHash = this.generateHash();
        this.prizes = this.extract();
        return this.parse;
    }
    get parse() {
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
    generateHash() {
        const sha512 = Sha512.create();
        sha512.update(`${this.hash}${this.prevDrawHash}`);
        return sha512.digest().toHex();
    }
    extract() {
        const extractNumbersOfString = (str) => str.replace(/\D/g, "");
        const stripped = extractNumbersOfString(this.drawHash);
        const draw = stripped.substr(0, 20);
        return [
            draw.substr(0, 4),
            draw.substr(4, 4),
            draw.substr(8, 4),
            draw.substr(12, 4),
            draw.substr(16, 4)
        ];
    }
    getModern() {
        const value = this.prizes
            .reduce((a, p) => a + Number(p), 0)
            .toString()
            .substr(-4);
        return value.padStart(4, "0");
    }
    getRio() {
        const values = this.prizes.slice(0, 2);
        let mult = values.reduce((a, b) => a * Number(b), 1).toString();
        mult.length < 6 && (mult = mult.padStart(6, "0"));
        return mult.substr(-6).substr(0, 3);
    }
    getGrupoSalteado() {
        const prize = this.prizes[0];
        const decena = +prize.substr(-2);
        const number = decena * 4;
        const last2digit = number.toString().padStart(4, "0");
        return this.getPrizeGroup(last2digit);
    }
    getRefund() {
        const suma = this.prizes.reduce((acum, n) => acum + +n, 0);
        return (suma % 10).toString();
    }
    getPrizeGroup(prize) {
        const last2digits = prize.toString().slice(-2);
        return last2digits == "00"
            ? 25
            : Number(last2digits) % 4 == 0
                ? Number(last2digits) / 4
                : Math.floor(Number(last2digits) / 4) + 1;
    }
    set Prizes(prizes) {
        this.prizes = prizes;
    }
}
exports.PrizesService = PrizesService;
//# sourceMappingURL=index.js.map