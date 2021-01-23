import * as x_ from '../etc/_Tools'
import * as _ from 'lodash'
import * as tp from '../etc/types'
import * as R from 'ramda'

/**
 * The original tokens, and the indexes that need to be masked
 */
 const emptyFullResponse: tp.FullSingleTokenInfo[] = [{
     text: '[SEP]',
     embeddings: [],
     contexts: [],
     bpe_token: '',
     bpe_pos: '',
     bpe_dep: '',
     bpe_is_ent: null,
     topk_words: [],
     topk_probs: []
 }]

export class TokenDisplay  {
    tokenData:tp.FullSingleTokenInfo[]
    maskInds:number[]

    constructor(tokens=emptyFullResponse, maskInds=[]){
        this.tokenData = tokens;
        this.maskInds = maskInds;
    }

    /**
     * Push idx to the mask idx list in order from smallest to largest
     */
    mask(val) {
        const currInd = _.indexOf(this.maskInds, val)
        if (currInd == -1) {
            x_.orderedInsert_(this.maskInds, val)
        }
        else {
            console.log(`${val} already in maskInds!`);
            console.log(this.maskInds);
        }
    }

    toggle(val) {
        const currInd = _.indexOf(this.maskInds, val)
        if (currInd == -1) {
            console.log(`Masking ${val}`);
            this.mask(val)
        }
        else {
            console.log(`Unmasking ${val}`);
            this.unmask(val)
        }
    }

    unmask(val) {
        _.pull(this.maskInds, val);
    }

    resetMask() {
        this.maskInds = [];
    }

    length() {
        return this.tokenData.length;
    }

    concat(other: TokenDisplay) {
        const newTokens = _.concat(this.tokenData, other.tokenData);
        const newMask = _.concat(this.maskInds, other.maskInds.map(x => x + this.length()));
        return new TokenDisplay(newTokens, newMask);
    }
}

export class TokenWrapper {
    a: TokenDisplay

    constructor(r:tp.AttentionResponse){
        this.updateFromResponse(r);
    }

    updateFromResponse(r:tp.AttentionResponse) {
        const tokensA = r.aa.left;
        this.updateFromComponents(tokensA, [])
    }

    updateFromComponents(a:tp.FullSingleTokenInfo[], maskA:number[]){
        this.a = new TokenDisplay(a, maskA)
    }

    updateTokens(r: tp.AttentionResponse) {
        const desiredKeys = ['contexts', 'embeddings', 'topk_probs', 'topk_words']
        const newTokens = r.aa.left.map(v => R.pick(desiredKeys, v))

        const pairs = R.zip(this.a.tokenData, newTokens)

        pairs.forEach((d, i) => {
            Object.keys(d[1]).map(k => {
                d[0][k] = d[1][k]
            })
        })

    }

    /**
     * Mask the appropriate sentence at the index indicated
     */
    mask(sID:tp.TokenOptions, idx:number){
        this[sID].mask(idx)
        const opts = ["a", "b"]
        const Na = this.a.length();
    }
}

export function sideToLetter(side:tp.SideOptions, atype:tp.SentenceOptions){
    // const atype = conf.attType;
    if (atype == "all") {
        return "all"
    }
    const out = side == "left" ? atype[0] : atype[1] // No type checking?
    return out
}
