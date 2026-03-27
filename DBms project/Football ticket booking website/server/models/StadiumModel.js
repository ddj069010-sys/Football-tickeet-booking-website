class StadiumModel {
    constructor({ id, name, location, total_rows, seats_per_row, created_at }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.total_rows = total_rows;
        this.seats_per_row = seats_per_row;
        this.created_at = created_at;
    }
}

module.exports = StadiumModel;
