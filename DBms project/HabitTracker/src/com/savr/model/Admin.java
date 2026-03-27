package com.savr.model;

public class Admin extends User {
    
    public Admin() {
        super();
    }
    
    public Admin(int id, String name, String email, String password) {
        super(id, name, email, password);
    }
    
    @Override
    public void displayRole() {
        System.out.println("Admin User");
    }

    public void deleteAnyUser() {
        // admin power
        System.out.println("Admin power: Deleting user...");
    }
}
