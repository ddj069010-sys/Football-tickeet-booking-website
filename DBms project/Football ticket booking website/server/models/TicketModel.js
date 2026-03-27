class TicketModel {
    constructor({ id, user_id, match_id, seat_id, payment_id, booking_status, created_at, booking_date }) {
        this.id = id;
        this.user_id = user_id;
        this.match_id = match_id;
        this.seat_id = seat_id;
        this.payment_id = payment_id;
        this.booking_status = booking_status || 'confirmed';
        this.created_at = created_at;
        this.booking_date = booking_date;
    }
}

module.exports = TicketModel;
