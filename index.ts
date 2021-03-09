const forge = require("node-forge")
export interface IPrizes {
    prizes: string[];
    moderno: string;
    rio: string;
    salteado: string;
    refund: string;
    all?: string[];
}
const Sha512 = forge.md.sha512;
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
        return [0, 1, 2, 3, 4].reduce((acum, index) => {
            const stripped: string = this.drawHash.substr(13 * index, 13);
            const val: number = parseInt(stripped, 16) / Math.pow(2, 52);
            const num: number = Math.floor(val * 10000);
            return [...acum, num.toString().padStart(4, "0")];
        }, []);
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

import { Observable, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
export interface IBlock {
    hash: string,
    height: number,
    time: number
}
const exec = require('child_process').exec;

export class GetBitcoinHash {
    private lastBlock: IBlock
    public getNextBitcoinHashOfTimestamp(draw_ts_miliseconds: number): Observable<IBlock> {
        return timer(0, 1000)
            .pipe(
                switchMap(async () => {
                    const nextHeight = this.lastBlock ? this.lastBlock.height + 1 : await this.Getblockcount()
                    this.lastBlock = await this.getBlockByHeight(nextHeight)
                    return this.lastBlock.time * 1000
                }),
                filter((ts_miliseconds: number) => ts_miliseconds > draw_ts_miliseconds),
                map(() => this.lastBlock)
            )
    }
    private async Getblockhash(height: number): Promise<string> {
        return await this.request(this.curlCommand('getblockhash', height.toString()));
    }
    private async Getblock(hash: string): Promise<any> {
        return await this.request(this.curlCommand('getblock', `"${hash}"`))
    }
    private async getBlockByHeight(height: number): Promise<IBlock> {
        const hash: string = await this.Getblockhash(height)
        const block = await this.Getblock(hash)
        return block
    }
    private async Getblockcount(): Promise<number> {
        return await this.request(this.curlCommand('getblockcount', ''))
    }
    private curlCommand(method: string, params: string): string {
        return `curl --user ${process.env.BITCOIN_RPC_USER}:${process.env.BITCOIN_RPC_PASSWORD} --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "${method}", "params": [${params}] }' -H 'content-type: text/plain;' ${process.env.BITCOIN_RPC_URL}:${process.env.BITCOIN_RPC_PORT}/`
    }
    private request(curlCommand: string): Promise<any> {
        return new Promise(resolve => exec(curlCommand, (error, stdout) => {
            const parsed = error ? error : JSON.parse(stdout)
            resolve(parsed?.result);
        }))
    }
}