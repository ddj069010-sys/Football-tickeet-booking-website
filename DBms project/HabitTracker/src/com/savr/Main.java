package com.savr;

import com.savr.controller.HabitController;
import com.savr.utils.AnalyticsThread;

import java.net.InetAddress;
import java.net.UnknownHostException;

public class Main {
    public static void main(String[] args) {
        System.out.println("Initializing Habit Tracker System...");
        
        // 1. Networking Demo (Mandatory concept for syllabus)
        try {
            InetAddress ip = InetAddress.getLocalHost();
            System.out.println("System IP Resolved: " + ip.getHostAddress());
        } catch (UnknownHostException e) {
            System.out.println("Could not resolve local IP.");
        }

        // 2. Multithreading Demo (Running background thread concurrently)
        AnalyticsThread bgThread = new AnalyticsThread();
        bgThread.start();
        
        // 3. Start Controller (CLI menu loop)
        HabitController controller = new HabitController();
        controller.start();
        
        // Ensure background threads are cleaned up properly before exit
        try {
            bgThread.join();
        } catch (InterruptedException e) {
            System.err.println("Thread interruption during shutdown.");
        }
        System.out.println("System processes terminated successfully.");
    }
}
