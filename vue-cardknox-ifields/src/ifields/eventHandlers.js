import {
    LOADED,
    TOKEN,
    ERROR,
    AUTO_SUBMIT,
    UPDATE,
    CARD_TYPE,
    AMOUNT,
    MONTH,
    YEAR,
} from "./constants";
  
/**
*
* @param {MessageEvent} e
*/
export function _onMessage(e) {
    var data = e.data;
    if (e.source !== this.$refs.iFrameRef.contentWindow) return;
    switch (data.action) {
        case LOADED:
            this.log("Message received: ifield loaded");
            this._onLoad();
            break;
        case TOKEN:
            this.log("Message received: " + TOKEN);
            this._onToken(data);
            break;
        case AUTO_SUBMIT:
            this.log("Message received: " + AUTO_SUBMIT);
            this._onSubmit(data);
            break;
        case UPDATE:
            this.log("Message received: " + UPDATE);
            this._onUpdate(data);
            break;
        default:
            break;
    }
    if (
        this.threeDS.enable3DS &&
        data.eci &&
        data.eci.length &&
        this.type === CARD_TYPE
    ) {
        this.log("Message received: eci");
        this.postMessage(data);
    }
}
export function _onLoad() {
    this.iFrameLoaded = true;
    this.setAccount(this.account);
    if (this.threeDS.enable3DS) {
        this.enable3DS(
            this.threeDS.waitForResponse,
            this.threeDS.waitForResponseTimeout
        );
        this.update3DS(AMOUNT, this.threeDS.amount);
        this.update3DS(MONTH, this.threeDS.month);
        this.update3DS(YEAR, this.threeDS.year);
    }
    this.init();
    if (this.issuer) this.updateIssuer(this.issuer);
    if (this.options.placeholder)
        this.setPlaceholder(this.options.placeholder);
    if (this.options.enableLogging) this.enableLogging();
    if (this.options.autoFormat)
        this.enableAutoFormat(this.options.autoFormatSeparator);
    if (this.options.autoSubmit)
        this.enableAutoSubmit(this.options.autoSubmitFormId);
    if (this.options.iFieldstyle) this.setStyle(this.options.iFieldstyle);
    if (this.onLoad) this.onLoad();
}
/**
 *
 * @param {{data: TokenData}} param0
 */
export function _onToken({ data }) {
    if (data.result === ERROR) {
        this.latestErrorTime = new Date();
        this.log("Token Error: " + data.errorMessage);
        if (this.onError) this.onError(data);
    } else {
        this.xTokenData = data;
        if (this.onToken) this.onToken(data);
    }
}
/**
 *
 * @param {{data: UpdateData}} param0
 */
export function _onUpdate({ data }) {
    this.ifieldDataCache = {
        length: this.type === CARD_TYPE ? data.cardNumberLength : data.length,
        isEmpty: data.isEmpty,
        isValid: data.isValid
    };
    if (data.isValid) {
        this.getToken();
    }
    if (this.onUpdate) this.onUpdate(data);
}

/**
 *
 * @param {{data: SubmitData}} param0
 */
export function _onSubmit({ data }) {
    //call first before submit is triggered
    if (this.onSubmit) this.onSubmit(data);
    if (data && data.formId) {
        document.getElementById(data.formId).dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true
            })
        );
    }
}