import {ValidationError} from "../../../Utilities/errors.js";


export default class Password{
    constructor(value){

        if(!value){
            throw new ValidationError('Password is required');
        }
        if(value.length < 6){
            throw new ValidationError('Password must be at least 6 characters long');
        }

        this._value = value;
        Object.freeze(this);
    }

    get value() {
        return this._value;
    }
}