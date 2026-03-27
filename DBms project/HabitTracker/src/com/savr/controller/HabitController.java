package com.savr.controller;

import com.savr.dao.HabitDAO;
import com.savr.dao.RecordDAO;
import com.savr.dao.UserDAO;
import com.savr.model.Admin;
import com.savr.model.Habit;
import com.savr.model.Record;
import com.savr.model.Trackable;
import com.savr.model.User;
import com.savr.utils.InvalidLoginException;
import com.savr.utils.UserNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

public class HabitController {
    private UserDAO userDAO;
    private HabitDAO habitDAO;
    private RecordDAO recordDAO;
    private Scanner scanner;
    private User loggedInUser;

    public HabitController() {
        this.userDAO = new UserDAO();
        this.habitDAO = new HabitDAO();
        this.recordDAO = new RecordDAO();
        this.scanner = new Scanner(System.in);
    }

    public void start() {
        while (true) {
            System.out.println("\n=== Habit Tracker CLI ===");
            System.out.println("1. Register");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Choose an option: ");
            
            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input. Try again.");
                scanner.next();
                continue;
            }
            
            int choice = scanner.nextInt();
            scanner.nextLine(); // consume newline
            
            switch (choice) {
                case 1:
                    register();
                    break;
                case 2:
                    login();
                    break;
                case 3:
                    System.out.println("Exiting System...");
                    return;
                default:
                    System.out.println("Invalid option.");
            }
        }
    }

    private void register() {
        System.out.print("Enter Name: ");
        String name = scanner.nextLine();
        System.out.print("Enter Email (include 'admin' to test admin role): ");
        String email = scanner.nextLine();
        System.out.print("Enter Password: ");
        String password = scanner.nextLine();
        
        User user = userDAO.registerUser(name, email, password);
        if (user != null) {
            System.out.println("Registration successful! You can now log in.");
        } else {
            System.out.println("Registration failed. Please try again.");
        }
    }

    private void login() {
        System.out.print("Enter Email: ");
        String email = scanner.nextLine();
        System.out.print("Enter Password: ");
        String password = scanner.nextLine();
        
        try {
            loggedInUser = userDAO.loginUser(email, password);
            System.out.println("Login Successful! Welcome, " + loggedInUser.getName());
            
            // Polymorphism & dynamic dispatch in action
            loggedInUser.displayRole();
            
            userMenu();
            
        } catch (InvalidLoginException | UserNotFoundException e) {
            System.out.println("Login Error: " + e.getMessage());
        }
    }

    private void userMenu() {
        while (loggedInUser != null) {
            System.out.println("\n--- User Dashboard ---");
            System.out.println("1. Add Habit");
            System.out.println("2. View Habits");
            System.out.println("3. Track Habit (Mark Complete for Today)");
            System.out.println("4. View Analytics (Streak)");
            if (loggedInUser instanceof Admin) {
                System.out.println("5. Admin Menu (Demo inherited method)");
            }
            System.out.println("0. Logout");
            System.out.print("Choice: ");
            
            if (!scanner.hasNextInt()) {
                System.out.println("Invalid input. Try again.");
                scanner.next();
                continue;
            }
            
            int choice = scanner.nextInt();
            scanner.nextLine();
            
            switch (choice) {
                case 1:
                    addHabit();
                    break;
                case 2:
                    viewHabits();
                    break;
                case 3:
                    trackHabit();
                    break;
                case 4:
                    viewAnalytics();
                    break;
                case 5:
                    if (loggedInUser instanceof Admin) {
                        ((Admin) loggedInUser).deleteAnyUser();
                    } else {
                        System.out.println("Invalid option.");
                    }
                    break;
                case 0:
                    loggedInUser = null;
                    System.out.println("Logged out successfully.");
                    return;
                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    private void addHabit() {
        System.out.print("Enter Habit Name: ");
        String name = scanner.nextLine();
        Habit habit = new Habit(0, loggedInUser.getId(), name);
        habitDAO.addHabit(habit);
        System.out.println("Habit added successfully!");
    }

    private void viewHabits() {
        List<Habit> habits = habitDAO.getHabitsByUser(loggedInUser.getId());
        if (habits.isEmpty()) {
            System.out.println("No habits found.");
            return;
        }
        System.out.println("Your Habits:");
        for (Habit h : habits) {
            System.out.println(h.getId() + ". " + h.getName());
        }
    }

    private void trackHabit() {
        viewHabits();
        System.out.print("Enter Habit ID to mark complete for today: ");
        if (!scanner.hasNextInt()) {
            System.out.println("Invalid ID.");
            scanner.next();
            return;
        }
        int habitId = scanner.nextInt();
        scanner.nextLine();
        
        List<Habit> habits = habitDAO.getHabitsByUser(loggedInUser.getId());
        Habit selectedHabit = habits.stream().filter(h -> h.getId() == habitId).findFirst().orElse(null);
        
        if (selectedHabit != null) {
            // Syllabus requirement: Polymorphism usage with Interface reference
            Trackable trackable = selectedHabit;
            trackable.markComplete();
            
            recordDAO.markHabitComplete(selectedHabit.getId(), LocalDate.now());
            System.out.println("Habit safely recorded in database.");
        } else {
            System.out.println("Invalid Habit ID.");
        }
    }

    private void viewAnalytics() {
        System.out.print("Enter Habit ID to check streak: ");
        if (!scanner.hasNextInt()) {
            System.out.println("Invalid ID.");
            scanner.next();
            return;
        }
        int habitId = scanner.nextInt();
        scanner.nextLine();
        
        List<Record> records = recordDAO.getRecordsForHabit(habitId);
        int streak = 0;
        
        LocalDate expectedDate = LocalDate.now();
        for (Record r : records) {
            if (r.isCompleted() && (r.getDate().equals(expectedDate) || r.getDate().equals(expectedDate.minusDays(1)))) {
                if (r.getDate().equals(expectedDate)) {
                    streak++;
                    expectedDate = r.getDate().minusDays(1);
                } else if (r.getDate().equals(expectedDate.minusDays(1))) {
                    streak++;
                    expectedDate = r.getDate().minusDays(2);
                }
            } else {
                break;
            }
        }
        
        System.out.println("Current Streak for this habit: " + streak + " days! 🔥");
    }
}
