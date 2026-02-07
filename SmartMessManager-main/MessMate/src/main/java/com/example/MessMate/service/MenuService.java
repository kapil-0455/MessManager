package com.example.MessMate.service;

import com.example.MessMate.entity.DailyMenu;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.repository.DailyMenuRepository;
import com.example.MessMate.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuService {
    
    private final MenuItemRepository menuItemRepository;
    private final DailyMenuRepository dailyMenuRepository;
    
    // MenuItem operations
    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    public List<MenuItem> getAvailableMenuItemsByMealType(MenuItem.MealType mealType) {
        return menuItemRepository.findByMealTypeAndIsAvailableTrue(mealType);
    }
    
    public List<MenuItem> getMenuItemsByCategory(MenuItem.FoodCategory category) {
        return menuItemRepository.findByCategoryAndIsAvailableTrue(category);
    }
    
    public List<MenuItem> getVegetarianMenuItems() {
        return menuItemRepository.findByIsVegetarianAndIsAvailableTrue(true);
    }
    
    public List<MenuItem> searchMenuItems(String name) {
        return menuItemRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(name);
    }
    
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }
    
    public MenuItem updateMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
    
    // DailyMenu operations
    public DailyMenu createDailyMenu(DailyMenu dailyMenu) {
        return dailyMenuRepository.save(dailyMenu);
    }
    
    public List<DailyMenu> getTodaysMenu() {
        return dailyMenuRepository.findByMenuDateAndIsActiveTrue(LocalDate.now());
    }
    
    public Optional<DailyMenu> getTodaysMenuByMealType(MenuItem.MealType mealType) {
        return dailyMenuRepository.findByMenuDateAndMealTypeAndIsActiveTrue(LocalDate.now(), mealType);
    }
    
    public List<DailyMenu> getMenuByDate(LocalDate date) {
        return dailyMenuRepository.findByMenuDateAndIsActiveTrue(date);
    }
    
    public List<DailyMenu> getWeeklyMenu(LocalDate startDate, LocalDate endDate) {
        return dailyMenuRepository.findByMenuDateBetweenAndIsActiveTrue(startDate, endDate);
    }
    
    public DailyMenu updateDailyMenu(DailyMenu dailyMenu) {
        return dailyMenuRepository.save(dailyMenu);
    }
    
    public void deleteDailyMenu(Long id) {
        dailyMenuRepository.deleteById(id);
    }
}
