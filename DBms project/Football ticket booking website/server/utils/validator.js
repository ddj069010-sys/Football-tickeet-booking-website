function validateBooking(data) {
    if (!data.match_id) throw new Error("Match ID required");
    if (!data.seat_id) throw new Error("Seat ID required");
}

module.exports = { validateBooking };
