"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBitcoinHash = exports.PrizesService = void 0;
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
        return [0, 1, 2, 3, 4].reduce((acum, index) => {
            const stripped = this.drawHash.substr(13 * index, 13);
            const val = parseInt(stripped, 16) / Math.pow(2, 52);
            const num = Math.floor(val * 10000);
            return [...acum, num.toString().padStart(4, "0")];
        }, []);
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
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const exec = require('child_process').exec;
class GetBitcoinHash {
    getNextBitcoinHashOfTimestamp(draw_ts_miliseconds) {
        return rxjs_1.timer(0, 1000)
            .pipe(operators_1.switchMap(async () => {
            const nextHeight = this.lastBlock ? this.lastBlock.height + 1 : await this.Getblockcount();
            this.lastBlock = await this.getBlockByHeight(nextHeight);
            return this.lastBlock.time * 1000;
        }), operators_1.filter((ts_miliseconds) => ts_miliseconds > draw_ts_miliseconds), operators_1.map(() => this.lastBlock));
    }
    async Getblockhash(height) {
        return await this.request(this.curlCommand('getblockhash', height.toString()));
    }
    async Getblock(hash) {
        return await this.request(this.curlCommand('getblock', `"${hash}"`));
    }
    async getBlockByHeight(height) {
        const hash = await this.Getblockhash(height);
        const block = await this.Getblock(hash);
        return block;
    }
    async Getblockcount() {
        return await this.request(this.curlCommand('getblockcount', ''));
    }
    curlCommand(method, params) {
        return `curl --user ${process.env.BITCOIN_RPC_USER}:${process.env.BITCOIN_RPC_PASSWORD} --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "${method}", "params": [${params}] }' -H 'content-type: text/plain;' ${process.env.BITCOIN_RPC_URL}:${process.env.BITCOIN_RPC_PORT}/`;
    }
    request(curlCommand) {
        return new Promise(resolve => exec(curlCommand, (error, stdout) => {
            const parsed = error ? error : JSON.parse(stdout);
            resolve(parsed?.result);
        }));
    }
}
exports.GetBitcoinHash = GetBitcoinHash;
//# sourceMappingURL=index.js.map