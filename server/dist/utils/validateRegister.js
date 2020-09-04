"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    console.log(options);
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'Invalid Email',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'username cannot include an @',
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'length must be greater than two',
            },
        ];
    }
    if (options.password.length <= 3) {
        return [
            {
                field: 'password',
                message: 'length must be greater than three',
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map