package com.savr.utils;

public class AnalyticsThread extends Thread {
    @Override
    public void run() {
        try {
            System.out.println("[AnalyticsThread] Calculating background streak analytics...");
            Thread.sleep(1500); // Simulate processing time
            System.out.println("[AnalyticsThread] Streak calculation complete in background.");
        } catch (InterruptedException e) {
            System.out.println("[AnalyticsThread] Interrupted.");
        }
    }
}
