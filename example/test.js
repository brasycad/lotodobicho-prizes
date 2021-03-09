"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrawPrizes = void 0;
const operators_1 = require("rxjs/operators");
const index_1 = require("../index");
exports.getDrawPrizes = (ts_draw, prevDrawHash) => {
    const getBitcoinHash = new index_1.GetBitcoinHash();
    const prizesService = new index_1.PrizesService();
    return getBitcoinHash.getNextBitcoinHashOfTimestamp(ts_draw)
        .pipe(operators_1.map((block) => prizesService.init(block.hash, prevDrawHash)));
};
//# sourceMappingURL=test.js.map