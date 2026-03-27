package com.savr.service;

import com.savr.model.Habit;
import java.util.List;

public interface HabitService {
    void addHabit(Habit habit);
    void deleteHabit(int id);
    List<Habit> getAllHabits(int userId);
}
