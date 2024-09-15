"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMockFormCollection = exports.makeFields = exports.commonPasswords = exports.TOO_SHORT = exports.IS_REQUIRED = exports.IS_TOO_COMMON = exports.commonUserNames = exports.NO_EMPTY_CHARS = void 0;
exports.isString = isString;
exports.isSingleWord = isSingleWord;
exports.isCommonUserName = isCommonUserName;
exports.isRequired = isRequired;
exports.isLongEnough = isLongEnough;
exports.isNotCommonPassword = isNotCommonPassword;
const Forest_1 = __importDefault(require("../../Forest"));
function isString(field) {
    if (!field.value && !field.isRequired) {
        return null;
    }
    if (typeof field.value !== 'string') {
        return {
            message: 'must be a string',
            severity: 10,
        };
    }
}
exports.NO_EMPTY_CHARS = 'must not have empty characters';
function isSingleWord(field, errors) {
    if (errors.length) {
        return null;
    }
    const { value } = field;
    const s = value;
    if (/\s+/.test(s)) {
        return {
            message: exports.NO_EMPTY_CHARS,
            severity: 2,
        };
    }
}
exports.commonUserNames = 'john,user,username,companyname'.split(',');
exports.IS_TOO_COMMON = 'is too common';
exports.IS_REQUIRED = 'required';
function isCommonUserName(field, errors) {
    if (errors.length) {
        return null;
    }
    const { value } = field;
    const s = value;
    if (exports.commonUserNames.includes(s.toLowerCase())) {
        return {
            message: exports.IS_TOO_COMMON,
            severity: 1,
        };
    }
}
function isRequired(field) {
    if (field.isRequired && !field.value) {
        return {
            message: exports.IS_REQUIRED,
            severity: 3,
        };
    }
}
exports.TOO_SHORT = 'field must be 8 or more characters';
function isLongEnough(field, errors) {
    if (errors.length || typeof field.value !== 'string') {
        return;
    }
    if (field.value.length < 8) {
        return {
            message: exports.TOO_SHORT,
            severity: 5,
        };
    }
}
exports.commonPasswords = 'password,abc123'.split(',');
function isNotCommonPassword(field, errors) {
    if (errors.length) {
        return null;
    }
    const { value } = field;
    const s = value;
    if (exports.commonPasswords.includes(s.toLowerCase())) {
        return {
            message: exports.IS_TOO_COMMON,
        };
    }
}
const makeFields = (values = {
    username: 'John',
    password: 'foo bar',
}) => new Map([
    ['username', { name: 'username', value: values['username'] ?? '' }],
    [
        'password',
        {
            name: 'password',
            value: values['password'] ?? '',
        },
    ],
]);
exports.makeFields = makeFields;
const makeMockFormCollection = () => ({
    forest: new Forest_1.default(),
    setFieldValue() { },
    updateFieldProperty() { },
    updateField() { },
    commit() { },
    hasField() {
        return false;
    },
    field() {
        return undefined;
    },
    fieldBaseParams: new Map([
        [
            'username',
            {
                label: 'User Name',
                isRequired: true,
                validators: [isRequired, isString, isSingleWord, isCommonUserName],
            },
        ],
        [
            'password',
            {
                isRequired: true,
                label: 'Password',
                validators: [
                    isRequired,
                    isString,
                    isSingleWord,
                    isNotCommonPassword,
                    isLongEnough,
                ],
            },
        ],
    ]),
});
exports.makeMockFormCollection = makeMockFormCollection;
