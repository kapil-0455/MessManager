package com.example.MessMate.service;

import com.example.MessMate.entity.MealOrder;
import com.example.MessMate.entity.MenuItem;
import com.example.MessMate.entity.User;
import com.example.MessMate.repository.MealOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final MealOrderRepository mealOrderRepository;
    
    public MealOrder createOrder(MealOrder order) {
        // Calculate total amount
        BigDecimal totalAmount = order.getMenuItems().stream()
                .map(MenuItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(totalAmount);
        order.setStatus(MealOrder.OrderStatus.PENDING);
        
        return mealOrderRepository.save(order);
    }
    
    public List<MealOrder> getUserOrders(User user) {
        return mealOrderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<MealOrder> getOrdersByStatus(MealOrder.OrderStatus status) {
        return mealOrderRepository.findByStatus(status);
    }
    
    public List<MealOrder> getTodaysOrders(MenuItem.MealType mealType) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return mealOrderRepository.findByMealTypeAndCreatedAtBetween(mealType, startOfDay, endOfDay);
    }
    
    public Optional<MealOrder> getOrderById(Long id) {
        return mealOrderRepository.findById(id);
    }
    
    public MealOrder updateOrderStatus(Long orderId, MealOrder.OrderStatus status) {
        Optional<MealOrder> orderOptional = mealOrderRepository.findById(orderId);
        if (orderOptional.isPresent()) {
            MealOrder order = orderOptional.get();
            order.setStatus(status);
            return mealOrderRepository.save(order);
        }
        throw new RuntimeException("Order not found");
    }
    
    public long getUserOrderCount(User user, LocalDateTime start, LocalDateTime end) {
        return mealOrderRepository.countByUserAndCreatedAtBetween(user, start, end);
    }
    
    public void cancelOrder(Long orderId) {
        updateOrderStatus(orderId, MealOrder.OrderStatus.CANCELLED);
    }
}
