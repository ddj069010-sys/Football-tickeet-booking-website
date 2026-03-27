class SeatModel {
    constructor({ id, match_id, row_label, row_number, seat_number, seat_type, is_booked, locked_until }) {
        this.id = id;
        this.match_id = match_id;
        this.row_label = row_label;
        this.row_number = row_number;
        this.seat_number = seat_number;
        this.seat_type = seat_type || 'regular';
        this.is_booked = is_booked || false;
        this.locked_until = locked_until || null;
    }
}

module.exports = SeatModel;
