package com.savr.service;

import com.savr.dao.HabitDAO;
import com.savr.model.Habit;
import java.util.List;

public class HabitServiceImpl implements HabitService {
    private HabitDAO habitDAO;

    public HabitServiceImpl() {
        this.habitDAO = new HabitDAO();
    }

    @Override
    public void addHabit(Habit habit) {
        habitDAO.addHabit(habit);
        System.out.println("Habit service processed insertion for: " + habit.getName());
    }

    @Override
    public void deleteHabit(int id) {
        habitDAO.deleteHabit(id);
        System.out.println("Habit service processed deletion.");
    }

    @Override
    public List<Habit> getAllHabits(int userId) {
        return habitDAO.getHabitsByUser(userId);
    }
}
