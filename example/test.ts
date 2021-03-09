import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { GetBitcoinHash, PrizesService, IPrizes, IBlock } from '../index'

export const getDrawPrizes = (ts_draw: number, prevDrawHash: string): Observable<IPrizes> => {
    const getBitcoinHash = new GetBitcoinHash()
    const prizesService = new PrizesService()

    return getBitcoinHash.getNextBitcoinHashOfTimestamp(ts_draw)
        .pipe(
            map((block: IBlock) => prizesService.init(block.hash, prevDrawHash))
        )
}