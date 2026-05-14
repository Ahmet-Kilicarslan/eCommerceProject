import {ValidationError} from "../../../Utilities/errors.js";


export default class Email{
constructor(value) {

    if (!value) {
        throw new Error("Email required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(value)) {
        throw new Error("Invalid email format");
    }
this._value = value.toLowerCase().trim();

    Object.freeze(this);//makes it immutable

}

get value() {
    return this._value;
}

equals(otherValue) {
    return otherValue instanceof Email && this._value === otherValue;
}



}
