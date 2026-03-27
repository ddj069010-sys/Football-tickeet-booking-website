package com.savr.dao;

import com.savr.model.User;
import com.savr.model.Admin;
import com.savr.utils.DBConnection;
import com.savr.utils.InvalidLoginException;
import com.savr.utils.UserNotFoundException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {
    
    public User registerUser(String name, String email, String password) {
        String query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query, PreparedStatement.RETURN_GENERATED_KEYS)) {
            
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, password);
            ps.executeUpdate();
            
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                return new User(id, name, email, password);
            }
        } catch (SQLException e) {
            System.err.println("Error registering user: " + e.getMessage());
        }
        return null;
    }

    public User loginUser(String email, String password) throws InvalidLoginException, UserNotFoundException {
        String query = "SELECT * FROM users WHERE email=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(query)) {
            
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            
            if (rs.next()) {
                String storedPassword = rs.getString("password");
                if (!storedPassword.equals(password)) {
                    throw new InvalidLoginException("Wrong password provided for user: " + email);
                }
                
                int id = rs.getInt("id");
                String name = rs.getString("name");
                
                // Simple mock for inheritance behavior demo: emails with 'admin' get Admin role
                if (email.contains("admin")) {
                    return new Admin(id, name, email, password);
                }
                return new User(id, name, email, password);
            } else {
                throw new UserNotFoundException("User with email " + email + " not found.");
            }
        } catch (SQLException e) {
            System.err.println("SQL Error during login: " + e.getMessage());
        }
        return null;
    }
}
