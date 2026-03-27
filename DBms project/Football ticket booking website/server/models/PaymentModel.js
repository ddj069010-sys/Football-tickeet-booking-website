class PaymentModel {
    constructor({ id, user_id, match_id, payment_method, transaction_id, amount, payment_status, created_at }) {
        this.id = id;
        this.user_id = user_id;
        this.match_id = match_id;
        this.payment_method = payment_method;
        this.transaction_id = transaction_id;
        this.amount = amount;
        this.payment_status = payment_status || 'pending';
        this.created_at = created_at;
    }
}

module.exports = PaymentModel;
