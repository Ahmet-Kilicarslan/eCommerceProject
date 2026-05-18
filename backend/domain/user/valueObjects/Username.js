import {ValidationError} from "../../../Utilities/errors.js";


export default class Username {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new ValidationError("Username is required");
        }

        if (value.length < 3 || value.length > 50) {
            throw new ValidationError("Username must be between 3-50 characters");
        }

        if (/[<>]/.test(value)) {
            throw new ValidationError("Username contains invalid characters");
        }

        this._value = value.trim();
        Object.freeze(this);
    }

    get value() {
        return this._value;
    }


}
