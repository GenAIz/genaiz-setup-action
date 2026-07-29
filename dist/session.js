export class Session {
    id;
    expired;
    constructor(raw) {
        const idKey = Object.keys(raw).find(k => k.toLowerCase() === "id");
        const expiredKey = Object.keys(raw).find(k => k.toLowerCase() === "expired");
        if (idKey != undefined) {
            this.id = raw[idKey];
        }
        if (expiredKey != undefined) {
            this.expired = raw[expiredKey];
        }
    }
    validate(url) {
        if (this.id == undefined || this.id === 0) {
            throw Error(`GenAIz session for ${url} is unknown`);
        }
        if (this.expired == undefined || this.expired === true) {
            throw Error(`GenAIz session for ${url} is expired`);
        }
    }
}
