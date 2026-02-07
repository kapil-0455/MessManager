package com.example.MessMate.service;

import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Order(2)
public class DataInitializationService implements CommandLineRunner {
    
    private final MenuItemRepository menuItemRepository;
    
    @Override
    public void run(String... args) throws Exception {
        initializeMenuItems();
    }
    
    private void initializeMenuItems() {
        if (menuItemRepository.count() == 0) {
            List<MenuItem> menuItems = Arrays.asList(
                // Breakfast Items
                createMenuItem("Idli Sambar", "Steamed rice cakes with lentil curry", new BigDecimal("25.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Dosa", "Crispy rice pancake", new BigDecimal("30.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Upma", "Semolina breakfast dish", new BigDecimal("20.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Poha", "Flattened rice with vegetables", new BigDecimal("22.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.MAIN_COURSE, true, true),
                createMenuItem("Tea", "Hot milk tea", new BigDecimal("10.00"), 
                    MenuItem.MealType.BREAKFAST, MenuItem.FoodCategory.BEVERAGE, true, true),
                
                // Lunch Items
                createMenuItem("Rice", "Steamed white rice", new BigDecimal("15.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.RICE, true, true),
                createMenuItem("Dal Tadka", "Tempered lentil curry", new BigDecimal("25.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Vegetable Curry", "Mixed vegetable curry", new BigDecimal("30.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Chicken Curry", "Spicy chicken curry", new BigDecimal("45.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.CURRY, true, false),
                createMenuItem("Roti", "Indian flatbread", new BigDecimal("8.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.BREAD, true, true),
                createMenuItem("Salad", "Fresh vegetable salad", new BigDecimal("15.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.SALAD, true, true),
                createMenuItem("Curd Rice", "Rice with yogurt", new BigDecimal("20.00"), 
                    MenuItem.MealType.LUNCH, MenuItem.FoodCategory.RICE, true, true),
                
                // Snacks
                createMenuItem("Samosa", "Fried pastry with filling", new BigDecimal("12.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Pakora", "Vegetable fritters", new BigDecimal("15.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Sandwich", "Vegetable sandwich", new BigDecimal("25.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.SNACK, true, true),
                createMenuItem("Coffee", "Hot coffee", new BigDecimal("12.00"), 
                    MenuItem.MealType.SNACKS, MenuItem.FoodCategory.BEVERAGE, true, true),
                
                // Dinner Items
                createMenuItem("Chapati", "Whole wheat flatbread", new BigDecimal("8.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.BREAD, true, true),
                createMenuItem("Paneer Curry", "Cottage cheese curry", new BigDecimal("40.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.CURRY, true, true),
                createMenuItem("Fish Curry", "Spicy fish curry", new BigDecimal("50.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.CURRY, true, false),
                createMenuItem("Jeera Rice", "Cumin flavored rice", new BigDecimal("18.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.RICE, true, true),
                createMenuItem("Ice Cream", "Vanilla ice cream", new BigDecimal("25.00"), 
                    MenuItem.MealType.DINNER, MenuItem.FoodCategory.DESSERT, true, true)
            );
            
            menuItemRepository.saveAll(menuItems);
            System.out.println("Sample menu items initialized successfully!");
        }
    }
    
    private MenuItem createMenuItem(String name, String description, BigDecimal price, 
                                  MenuItem.MealType mealType, MenuItem.FoodCategory category, 
                                  boolean isAvailable, boolean isVegetarian) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setMealType(mealType);
        item.setCategory(category);
        item.setIsAvailable(isAvailable);
        item.setIsVegetarian(isVegetarian);
        return item;
    }
}
