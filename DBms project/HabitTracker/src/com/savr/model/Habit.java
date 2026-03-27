package com.savr.model;

public class Habit implements Trackable {
    private int id;
    private int userId;
    private String name;

    public Habit() {}

    public Habit(int id, int userId, String name) {
        this.id = id;
        this.userId = userId;
        this.name = name;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @Override
    public void markComplete() {
        System.out.println("Habit '" + this.name + "' marked complete!");
    }

    @Override
    public void getStatus() {
        System.out.println("Status for Habit: " + this.name);
    }
}
