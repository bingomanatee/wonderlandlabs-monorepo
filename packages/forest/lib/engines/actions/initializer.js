"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializer = void 0;
const constants_1 = require("../../constants");
/**
 * a generic initializer; it returns a seed's initial value.
 * Some intitializers may validate their data.
 */
exports.initializer = {
    name: constants_1.ACTION_NAME_INITIALIZER,
    delta(_, args) {
        if (_.tree.name === 'basic-engine')
            console.log(constants_1.ACTION_NAME_INITIALIZER, "....................... called with ", args);
        return args[0];
    },
};
