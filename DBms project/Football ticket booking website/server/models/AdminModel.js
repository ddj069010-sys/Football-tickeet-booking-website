const UserModel = require('./UserModel');

class AdminModel extends UserModel {
    constructor(data) {
        // Force the role to 'admin'
        super({ ...data, role: 'admin' });
    }
}

module.exports = AdminModel;
