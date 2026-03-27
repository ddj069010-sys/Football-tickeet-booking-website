class MatchModel {
    constructor({ id, home_team_id, away_team_id, stadium_id, match_date, base_price, total_seats, available_seats, created_at }) {
        this.id = id;
        this.home_team_id = home_team_id;
        this.away_team_id = away_team_id;
        this.stadium_id = stadium_id;
        this.match_date = match_date;
        this.base_price = base_price;
        this.total_seats = total_seats;
        this.available_seats = available_seats;
        this.created_at = created_at;
    }
}

module.exports = MatchModel;
