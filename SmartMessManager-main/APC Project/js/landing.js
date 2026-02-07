// ========================
// Fade-in Sections on Scroll
// ========================
const faders = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

faders.forEach(fader => observer.observe(fader));

// ========================
// Floating Elements: Plates & Steam
// ========================
const floatingElements = document.querySelectorAll('.floating-food, .plate, .steam');

floatingElements.forEach(elem => {
  // Random horizontal position
  let startX = Math.random() * (window.innerWidth - 50);
  elem.style.left = startX + 'px';

  // Horizontal sway for natural movement
  let swayAmplitude = 15 + Math.random() * 10; // px
  let direction = 1;

  setInterval(() => {
    const currentX = parseFloat(elem.style.left);
    if (currentX > startX + swayAmplitude) direction = -1;
    if (currentX < startX - swayAmplitude) direction = 1;
    elem.style.left = currentX + direction * 0.2 + 'px';
  }, 30);
});

// ========================
// Floating Emoji Animation (Hero)
// ========================
const hero = document.querySelector('.hero');
const foodIcons = ['🍕','🥗','🥘','🍔','🍩'];
const maxEmojis = 8; // Limit maximum emojis
let activeEmojis = 0;

setInterval(() => {
  if(activeEmojis >= maxEmojis) return; // Avoid overcrowding

  const food = document.createElement('div');
  food.classList.add('floating-food');
  food.textContent = foodIcons[Math.floor(Math.random() * foodIcons.length)];

  // Random horizontal start within hero width
  food.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  food.style.bottom = '-50px';
  food.style.fontSize = (18 + Math.random() * 18) + 'px';
  food.style.opacity = 0.5 + Math.random() * 0.3;
  hero.appendChild(food);
  activeEmojis++;

  // Animate upward
  let bottom = -50;
  const speed = 0.3 + Math.random() * 0.5; // Vertical speed
  const swayAmplitude = 15 + Math.random() * 10; // Horizontal sway
  let direction = 1;

  const interval = setInterval(() => {
    bottom += speed;
    food.style.bottom = bottom + 'px';

    // Horizontal sway
    let currentX = parseFloat(food.style.left);
    if (currentX > parseFloat(food.style.left) + swayAmplitude) direction = -1;
    if (currentX < parseFloat(food.style.left) - swayAmplitude) direction = 1;
    food.style.left = currentX + direction * 0.2 + 'px';

    // Remove when out of screen
    if (bottom > window.innerHeight + 50) {
      clearInterval(interval);
      hero.removeChild(food);
      activeEmojis--;
    }
  }, 20);

}, 2500); // Spawn every 2.5s

// ========================
// Load Menu Items from Backend
// ========================
async function loadTodaysMenu() {
  try {
    const response = await fetch('http://localhost:8080/api/menu/daily/today');
    const result = await response.json();
    
    const menuCards = document.getElementById('menuCards');
    
    if (response.ok && result.success && result.data && result.data.length > 0) {
      // Clear loading message
      menuCards.innerHTML = '';
      
      // Display menu items from today's menu
      result.data.forEach(dailyMenu => {
        if (dailyMenu.menuItems && dailyMenu.menuItems.length > 0) {
          dailyMenu.menuItems.slice(0, 4).forEach(item => { // Show only first 4 items
            const menuCard = document.createElement('div');
            menuCard.className = 'menu-card';
            
            // Add emoji based on category
            let emoji = '🍽️';
            switch(item.category) {
              case 'RICE': emoji = '🍛'; break;
              case 'CURRY': emoji = '🍲'; break;
              case 'BREAD': emoji = '🥖'; break;
              case 'SALAD': emoji = '🥗'; break;
              case 'DESSERT': emoji = '🍩'; break;
              case 'BEVERAGE': emoji = '☕'; break;
              case 'SNACK': emoji = '🍿'; break;
              default: emoji = '🍽️';
            }
            
            menuCard.innerHTML = `${emoji} ${item.name}`;
            menuCards.appendChild(menuCard);
          });
        }
      });
    } else {
      // Fallback to sample menu items from backend
      const menuResponse = await fetch('http://localhost:8080/api/menu/items/meal-type/LUNCH');
      const menuResult = await menuResponse.json();
      
      if (menuResponse.ok && menuResult.success && menuResult.data) {
        menuCards.innerHTML = '';
        menuResult.data.slice(0, 4).forEach(item => {
          const menuCard = document.createElement('div');
          menuCard.className = 'menu-card';
          
          let emoji = '🍽️';
          switch(item.category) {
            case 'RICE': emoji = '🍛'; break;
            case 'CURRY': emoji = '🍲'; break;
            case 'BREAD': emoji = '🥖'; break;
            case 'SALAD': emoji = '🥗'; break;
            case 'DESSERT': emoji = '🍩'; break;
            case 'BEVERAGE': emoji = '☕'; break;
            case 'SNACK': emoji = '🍿'; break;
            default: emoji = '🍽️';
          }
          
          menuCard.innerHTML = `${emoji} ${item.name}`;
          menuCards.appendChild(menuCard);
        });
      } else {
        // Final fallback to static menu
        menuCards.innerHTML = `
          <div class="menu-card">🍛 Rice & Curry</div>
          <div class="menu-card">🥗 Fresh Salad</div>
          <div class="menu-card">🍕 Veggie Pizza</div>
          <div class="menu-card">🍩 Dessert</div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading menu:', error);
    // Fallback to static menu on error
    const menuCards = document.getElementById('menuCards');
    menuCards.innerHTML = `
      <div class="menu-card">🍛 Rice & Curry</div>
      <div class="menu-card">🥗 Fresh Salad</div>
      <div class="menu-card">🍕 Veggie Pizza</div>
      <div class="menu-card">🍩 Dessert</div>
    `;
  }
}

// Load menu when page loads
document.addEventListener('DOMContentLoaded', loadTodaysMenu);

// ========================
// Floating Reactions in Testimonials/CTA
// ========================
const reactions = document.querySelectorAll('.floating-reactions, .reaction-icons');
reactions.forEach(el => {
  let startX = Math.random() * (window.innerWidth - 50);
  el.style.left = startX + 'px';
  let swayAmplitude = 15 + Math.random() * 10;
  let direction = 1;

  setInterval(() => {
    const currentX = parseFloat(el.style.left);
    if(currentX > startX + swayAmplitude) direction = -1;
    if(currentX < startX - swayAmplitude) direction = 1;
    el.style.left = currentX + direction * 0.3 + 'px';
  }, 30);
});
