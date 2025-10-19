class PositionCache {
    constructor(maxSize = 10000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    getKey(fen, depth) {
        return `${fen}:${depth}`;
    }

    get(fen, depth) {
        return this.cache.get(this.getKey(fen, depth));
    }

    set(fen, depth, analysis) {
        // Jeśli cache jest pełny, usuń najstarszy wpis
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(this.getKey(fen, depth), {
            ...analysis,
            timestamp: Date.now()
        });
    }

    has(fen, depth) {
        return this.cache.has(this.getKey(fen, depth));
    }
}

module.exports = PositionCache;