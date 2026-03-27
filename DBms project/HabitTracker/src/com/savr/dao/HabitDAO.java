package com.savr.dao;

import com.savr.model.Habit;
import com.savr.utils.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class HabitDAO {
    
    public void addHabit(Habit habit) {
        String query = "INSERT INTO habits (user_id, name) VALUES (?, ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            
            ps.setInt(1, habit.getUserId());
            ps.setString(2, habit.getName());
            ps.executeUpdate();
            
        } catch (SQLException e) {
            System.err.println("Error adding habit: " + e.getMessage());
        }
    }

    public void deleteHabit(int id) {
        String query = "DELETE FROM habits WHERE id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
             
            ps.setInt(1, id);
            ps.executeUpdate();
            
        } catch (SQLException e) {
             System.err.println("Error deleting habit: " + e.getMessage());
        }
    }

    public List<Habit> getHabitsByUser(int userId) {
        List<Habit> habits = new ArrayList<>();
        String query = "SELECT * FROM habits WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            
            while (rs.next()) {
                int id = rs.getInt("id");
                String name = rs.getString("name");
                habits.add(new Habit(id, userId, name));
            }
            
        } catch (SQLException e) {
            System.err.println("Error fetching habits: " + e.getMessage());
        }
        return habits;
    }
}
