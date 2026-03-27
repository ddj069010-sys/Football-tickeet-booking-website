class UserModel {
    constructor({ id, name, email, role, membership_type, is_active, created_at }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role || 'user';
        this.membership_type = membership_type || 'regular';
        this.is_active = is_active !== undefined ? is_active : true;
        this.created_at = created_at;
    }
}

module.exports = UserModel;
