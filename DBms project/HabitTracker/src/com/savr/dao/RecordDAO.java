package com.savr.dao;

import com.savr.model.Record;
import com.savr.utils.DBConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class RecordDAO {
    
    public void markHabitComplete(int habitId, LocalDate date) {
        String query = "INSERT INTO records (habit_id, date, status) VALUES (?, ?, ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            
            ps.setInt(1, habitId);
            ps.setDate(2, Date.valueOf(date));
            ps.setBoolean(3, true);
            ps.executeUpdate();
            
        } catch (SQLException e) {
             System.err.println("Error marking habit complete: " + e.getMessage());
        }
    }
    
    public List<Record> getRecordsForHabit(int habitId) {
        List<Record> records = new ArrayList<>();
        // Fetch ordered by date descending
        String query = "SELECT * FROM records WHERE habit_id = ? ORDER BY date DESC";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            
            ps.setInt(1, habitId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                int id = rs.getInt("id");
                LocalDate date = rs.getDate("date").toLocalDate();
                boolean status = rs.getBoolean("status");
                records.add(new Record(id, habitId, date, status));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting records: " + e.getMessage());
        }
        return records;
    }
}
