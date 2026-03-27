package com.savr.model;

import java.util.ArrayList;
import java.util.List;

public class User extends Person {
    private List<Habit> habits;

    public User() {
        super();
        this.habits = new ArrayList<>();
    }

    public User(int id, String name, String email, String password) {
        super(id, name, email, password);
        this.habits = new ArrayList<>();
    }

    public List<Habit> getHabits() {
        return habits;
    }

    public void setHabits(List<Habit> habits) {
        this.habits = habits;
    }

    @Override
    public void displayRole() {
        System.out.println("Regular User");
    }
}
