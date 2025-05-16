import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faMinus, 
  faUtensils, 
  faTint, 
  faChartPie, 
  faBullseye,
  faTimes,
  faLeaf
} from "@fortawesome/free-solid-svg-icons";
import "./Nutrition.css";

// Sample recipes database moved outside component
const recipes = [
  {
    id: 1,
    name: "Greek Yogurt Parfait",
    ingredients: ["greek yogurt", "honey", "berries", "granola"],
    instructions: "Layer yogurt, berries, and granola in a glass. Drizzle with honey.",
    prepTime: "5 minutes",
    calories: 320,
    protein: 18,
    carbs: 45,
    fat: 8,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["breakfast", "high-protein", "quick"]
  },
  {
    id: 2,
    name: "Avocado Toast with Egg",
    ingredients: ["bread", "avocado", "eggs", "salt", "pepper", "red pepper flakes"],
    instructions: "Toast bread, mash avocado on top, add fried or poached egg, season with salt, pepper and red pepper flakes.",
    prepTime: "10 minutes",
    calories: 380,
    protein: 15,
    carbs: 30,
    fat: 22,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["breakfast", "high-fat", "vegetarian"]
  },
  {
    id: 3,
    name: "Chicken and Vegetable Stir-Fry",
    ingredients: ["chicken breast", "broccoli", "carrots", "bell peppers", "garlic", "soy sauce", "olive oil"],
    instructions: "Stir-fry chicken pieces until cooked, add vegetables and garlic, season with soy sauce.",
    prepTime: "20 minutes",
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 15,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["dinner", "high-protein", "meal-prep"]
  },
  {
    id: 4,
    name: "Mediterranean Quinoa Salad",
    ingredients: ["quinoa", "cucumber", "tomatoes", "red onion", "feta cheese", "olives", "olive oil", "lemon juice"],
    instructions: "Mix cooked quinoa with chopped vegetables, feta, and olives. Dress with olive oil and lemon juice.",
    prepTime: "15 minutes",
    calories: 340,
    protein: 12,
    carbs: 42,
    fat: 14,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["lunch", "vegetarian", "meal-prep"]
  },
  {
    id: 5,
    name: "Baked Salmon with Asparagus",
    ingredients: ["salmon", "asparagus", "lemon", "garlic", "olive oil", "salt", "pepper", "dill"],
    instructions: "Season salmon fillet, place on baking sheet with asparagus, bake until salmon is flaky.",
    prepTime: "25 minutes",
    calories: 380,
    protein: 32,
    carbs: 10,
    fat: 24,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["dinner", "high-protein", "low-carb"]
  },
  {
    id: 6,
    name: "Oatmeal with Fruits and Nuts",
    ingredients: ["oats", "milk", "banana", "berries", "nuts", "honey", "cinnamon"],
    instructions: "Cook oats with milk, top with sliced banana, berries, nuts, honey, and a sprinkle of cinnamon.",
    prepTime: "10 minutes",
    calories: 380,
    protein: 12,
    carbs: 60,
    fat: 10,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["breakfast", "vegetarian", "high-fiber"]
  },
  {
    id: 7,
    name: "Turkey and Hummus Wrap",
    ingredients: ["tortilla", "turkey", "hummus", "spinach", "tomatoes", "cucumber"],
    instructions: "Spread hummus on tortilla, layer with turkey slices and vegetables, roll up tightly.",
    prepTime: "5 minutes",
    calories: 320,
    protein: 22,
    carbs: 35,
    fat: 12,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["lunch", "high-protein", "quick"]
  },
  {
    id: 8,
    name: "Lentil Soup",
    ingredients: ["lentils", "carrots", "celery", "onion", "garlic", "tomatoes", "vegetable broth", "cumin"],
    instructions: "Sauté vegetables, add lentils, broth, and spices, simmer until lentils are tender.",
    prepTime: "35 minutes",
    calories: 280,
    protein: 18,
    carbs: 40,
    fat: 4,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["dinner", "vegetarian", "high-fiber"]
  },
  {
    id: 9,
    name: "Sweet Potato and Black Bean Bowl",
    ingredients: ["sweet potatoes", "black beans", "rice", "avocado", "lime", "cilantro", "cumin", "paprika"],
    instructions: "Roast diced sweet potatoes with spices, serve over rice with black beans, top with avocado and cilantro.",
    prepTime: "30 minutes",
    calories: 420,
    protein: 15,
    carbs: 70,
    fat: 10,
    image: "https://images.unsplash.com/photo-1543339500-40b3d910e1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["dinner", "vegetarian", "high-fiber"]
  },
  {
    id: 10,
    name: "Berry Protein Smoothie",
    ingredients: ["protein powder", "berries", "banana", "spinach", "milk", "ice"],
    instructions: "Blend all ingredients until smooth, adding more liquid if needed.",
    prepTime: "5 minutes",
    calories: 280,
    protein: 25,
    carbs: 35,
    fat: 5,
    image: "https://images.unsplash.com/photo-1553530666-ba11a90a0eda?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["breakfast", "high-protein", "quick"]
  },
  {
    id: 11,
    name: "Chicken Adobo",
    ingredients: ["chicken thighs", "soy sauce", "vinegar", "garlic", "black peppercorns", "bay leaves", "cooking oil", "rice"],
    instructions: "Marinate chicken in soy sauce, vinegar, garlic, peppercorns, and bay leaves. Heat oil in a pan, brown chicken, then add marinade. Simmer until chicken is tender and sauce is reduced.",
    prepTime: "45 minutes",
    calories: 450,
    protein: 35,
    carbs: 30,
    fat: 25,
    image: "/src/assets/chicken-adobo.jpg",
    tags: ["filipino", "dinner", "high-protein"]
  },
  {
    id: 12,
    name: "Sinigang na Baboy",
    ingredients: ["pork belly", "tamarind", "tomatoes", "onion", "eggplant", "string beans", "spinach", "fish sauce", "rice"],
    instructions: "Boil pork until tender. Add tamarind, tomatoes, and onions. Simmer, then add vegetables. Season with fish sauce. Serve hot with rice.",
    prepTime: "60 minutes",
    calories: 420,
    protein: 28,
    carbs: 35,
    fat: 22,
    image: "/src/assets/sinigang.jpg",
    tags: ["filipino", "soup", "dinner"]
  },
  {
    id: 13,
    name: "Pancit Bihon",
    ingredients: ["rice noodles", "chicken breast", "carrots", "cabbage", "green beans", "garlic", "onion", "soy sauce", "fish sauce"],
    instructions: "Soak noodles. Stir-fry chicken with garlic and onions. Add vegetables and cook until tender. Add noodles and season with soy sauce and fish sauce.",
    prepTime: "30 minutes",
    calories: 380,
    protein: 25,
    carbs: 50,
    fat: 10,
    image: "/src/assets/pancit-bihon.jpg",
    tags: ["filipino", "noodles", "lunch"]
  },
  {
    id: 14,
    name: "Kare-Kare",
    ingredients: ["oxtail", "peanut butter", "eggplant", "string beans", "banana blossom", "ground rice", "garlic", "onion", "shrimp paste"],
    instructions: "Cook oxtail until tender. Make sauce with peanut butter and ground rice. Add vegetables and simmer until cooked. Serve with shrimp paste.",
    prepTime: "120 minutes",
    calories: 520,
    protein: 32,
    carbs: 25,
    fat: 35,
    image: "/src/assets/kare-kare.jpg",
    tags: ["filipino", "dinner", "special"]
  },
  {
    id: 15,
    name: "Ginisang Munggo",
    ingredients: ["mung beans", "spinach", "garlic", "onion", "pork bits", "fish sauce", "black pepper"],
    instructions: "Cook mung beans until soft. Sauté garlic, onion, and pork bits. Add cooked mung beans and spinach. Season with fish sauce and pepper.",
    prepTime: "40 minutes",
    calories: 280,
    protein: 18,
    carbs: 35,
    fat: 8,
    image: "/src/assets/ginisang-munggo.jpg",
    tags: ["filipino", "healthy", "lunch"]
  },
  {
    id: 16,
    name: "Beef Caldereta",
    ingredients: ["beef chunks", "potatoes", "carrots", "bell peppers", "liver spread", "tomato sauce", "cheese", "green peas", "bay leaves"],
    instructions: "Simmer beef until tender. Sauté vegetables, add beef, liver spread, and tomato sauce. Add cheese and simmer until sauce thickens.",
    prepTime: "90 minutes",
    calories: 480,
    protein: 35,
    carbs: 30,
    fat: 28,
    image: "/src/assets/caldereta.jpg",
    tags: ["filipino", "dinner", "special"]
  },
  {
    id: 17,
    name: "Ginataang Manok",
    ingredients: ["chicken pieces", "coconut milk", "ginger", "garlic", "onion", "green chili", "fish sauce", "spinach"],
    instructions: "Sauté garlic, ginger, and onion. Add chicken and cook until browned. Pour coconut milk and simmer. Add spinach and season with fish sauce.",
    prepTime: "45 minutes",
    calories: 420,
    protein: 30,
    carbs: 15,
    fat: 28,
    image: "/src/assets/ginataang-manok.jpg",
    tags: ["filipino", "coconut", "dinner"]
  },
  {
    id: 18,
    name: "Pinakbet",
    ingredients: ["bitter gourd", "eggplant", "okra", "string beans", "squash", "shrimp paste", "pork belly", "garlic", "onion"],
    instructions: "Sauté garlic, onion, and pork. Add vegetables and shrimp paste. Simmer until vegetables are tender but not overcooked.",
    prepTime: "35 minutes",
    calories: 290,
    protein: 15,
    carbs: 25,
    fat: 18,
    image: "/src/assets/pinakbet.jpg",
    tags: ["filipino", "vegetables", "healthy"]
  },
  {
    id: 19,
    name: "Grilled Chicken Quinoa Bowl",
    ingredients: ["chicken breast", "quinoa", "kale", "sweet potatoes", "avocado", "olive oil", "lemon juice", "garlic"],
    instructions: "Cook quinoa. Grill seasoned chicken breast. Roast sweet potatoes. Massage kale with olive oil and lemon. Combine all ingredients and top with sliced avocado.",
    prepTime: "35 minutes",
    calories: 520,
    protein: 42,
    carbs: 45,
    fat: 22,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["high-protein", "healthy", "meal-prep"]
  },
  {
    id: 20,
    name: "Tuna Protein Salad",
    ingredients: ["tuna steak", "mixed greens", "chickpeas", "hard-boiled eggs", "cherry tomatoes", "red onion", "olive oil", "balsamic vinegar"],
    instructions: "Sear tuna steak. Mix greens, chickpeas, sliced eggs, tomatoes, and onion. Top with sliced tuna and dress with olive oil and balsamic.",
    prepTime: "20 minutes",
    calories: 440,
    protein: 45,
    carbs: 25,
    fat: 18,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["high-protein", "low-carb", "lunch"]
  },
  {
    id: 21,
    name: "Tempeh Buddha Bowl",
    ingredients: ["tempeh", "brown rice", "broccoli", "carrots", "edamame", "tahini", "soy sauce", "ginger", "sesame seeds"],
    instructions: "Marinate and bake tempeh. Cook brown rice. Steam vegetables. Make tahini sauce. Assemble bowl and top with sesame seeds.",
    prepTime: "40 minutes",
    calories: 480,
    protein: 32,
    carbs: 55,
    fat: 20,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["vegetarian", "high-protein", "meal-prep"]
  },
  {
    id: 22,
    name: "Greek Yogurt Power Bowl",
    ingredients: ["greek yogurt", "mixed berries", "chia seeds", "almonds", "protein powder", "honey", "granola", "cinnamon"],
    instructions: "Mix protein powder with Greek yogurt. Top with berries, nuts, seeds, and a drizzle of honey. Sprinkle with cinnamon.",
    prepTime: "10 minutes",
    calories: 380,
    protein: 35,
    carbs: 40,
    fat: 15,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["breakfast", "high-protein", "quick"]
  },
  {
    id: 23,
    name: "Salmon and Lentil Bowl",
    ingredients: ["salmon fillet", "green lentils", "spinach", "roasted peppers", "feta cheese", "lemon", "dill", "olive oil"],
    instructions: "Cook lentils. Pan-sear salmon. Wilt spinach. Combine ingredients and top with crumbled feta, fresh dill, and lemon.",
    prepTime: "30 minutes",
    calories: 520,
    protein: 48,
    carbs: 35,
    fat: 25,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["high-protein", "omega-3", "dinner"]
  },
  {
    id: 24,
    name: "Turkey and Sweet Potato Skillet",
    ingredients: ["ground turkey", "sweet potatoes", "bell peppers", "onion", "garlic", "black beans", "cumin", "chili powder"],
    instructions: "Brown turkey with spices. Add diced sweet potatoes and vegetables. Cook until tender. Stir in black beans and heat through.",
    prepTime: "25 minutes",
    calories: 420,
    protein: 38,
    carbs: 45,
    fat: 12,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["high-protein", "meal-prep", "healthy"]
  },
  {
    id: 25,
    name: "Cottage Cheese Protein Plate",
    ingredients: ["cottage cheese", "hard-boiled eggs", "tuna", "cucumber", "cherry tomatoes", "whole grain crackers", "black pepper"],
    instructions: "Arrange cottage cheese, eggs, and tuna on a plate. Serve with sliced vegetables and crackers. Season with pepper.",
    prepTime: "15 minutes",
    calories: 380,
    protein: 45,
    carbs: 20,
    fat: 16,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["high-protein", "low-carb", "quick"]
  },
  {
    id: 26,
    name: "Tofu Stir-Fry with Edamame",
    ingredients: ["firm tofu", "edamame", "broccoli", "mushrooms", "brown rice", "ginger", "garlic", "soy sauce", "sesame oil"],
    instructions: "Press and cube tofu. Stir-fry with vegetables and edamame. Season with ginger, garlic, and soy sauce. Serve over brown rice.",
    prepTime: "30 minutes",
    calories: 400,
    protein: 28,
    carbs: 42,
    fat: 18,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    tags: ["vegetarian", "high-protein", "dinner"]
  }
];

const Nutrition = () => {
  // State for meal planning and tracking
  const [meals, setMeals] = useState([]);
  const [currentMeal, setCurrentMeal] = useState({
    id: null,
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    time: "",
    date: new Date().toISOString().split("T")[0], // today's date
    notes: ""
  });
  
  // State for water intake
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8); // 8 cups by default
  
  // State for nutritional goals
  const [nutritionalGoals, setNutritionalGoals] = useState({
    caloriesGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 65
  });

  // State for recipe finder
  const [ingredients, setIngredients] = useState([]);
  const [inputIngredient, setInputIngredient] = useState("");
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // State for UI
  const [activeTab, setActiveTab] = useState("meals");
  const [showMealModal, setShowMealModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Current date for filtering meals
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Current user's email for localStorage
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  
  // Get current user's email
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.email) {
          setCurrentUserEmail(user.email);
        }
      }
    } catch (error) {
      console.error("Error getting user email:", error);
    }
  }, []);
  
  // Storage keys
  const getMealsStorageKey = useCallback(() => 
    `nutrition_meals_${currentUserEmail || "default"}`, [currentUserEmail]
  );
  
  const getWaterStorageKey = useCallback(() => 
    `nutrition_water_${currentUserEmail || "default"}`, [currentUserEmail]
  );
  
  const getGoalsStorageKey = useCallback(() => 
    `nutrition_goals_${currentUserEmail || "default"}`, [currentUserEmail]
  );
  
  const getIngredientsStorageKey = useCallback(() => 
    `nutrition_ingredients_${currentUserEmail || "default"}`, [currentUserEmail]
  );
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = () => {
      try {
        const savedMeals = localStorage.getItem(getMealsStorageKey());
        if (savedMeals) setMeals(JSON.parse(savedMeals));

        const savedWater = localStorage.getItem(getWaterStorageKey());
        if (savedWater) setWaterIntake(JSON.parse(savedWater));

        const savedGoals = localStorage.getItem(getGoalsStorageKey());
        if (savedGoals) setNutritionalGoals(JSON.parse(savedGoals));

        const savedIngredients = localStorage.getItem(getIngredientsStorageKey());
        if (savedIngredients) setIngredients(JSON.parse(savedIngredients));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadInitialData();
  }, [getMealsStorageKey, getWaterStorageKey, getGoalsStorageKey, getIngredientsStorageKey]);

  // Save meals when updated
  useEffect(() => {
    localStorage.setItem(getMealsStorageKey(), JSON.stringify(meals));
  }, [meals, getMealsStorageKey]);

  // Save water intake when updated
  useEffect(() => {
    localStorage.setItem(getWaterStorageKey(), JSON.stringify(waterIntake));
  }, [waterIntake, getWaterStorageKey]);

  // Save goals when updated
  useEffect(() => {
    localStorage.setItem(getGoalsStorageKey(), JSON.stringify(nutritionalGoals));
  }, [nutritionalGoals, getGoalsStorageKey]);

  // Update recipe matches when ingredients change
  useEffect(() => {
    localStorage.setItem(getIngredientsStorageKey(), JSON.stringify(ingredients));
    findMatchingRecipes();
  }, [ingredients, getIngredientsStorageKey, findMatchingRecipes]);

  // Handle adding new ingredient
  const handleAddIngredient = () => {
    if (!inputIngredient.trim()) return;
    
    // Add ingredient if it doesn't already exist
    if (!ingredients.includes(inputIngredient.toLowerCase().trim())) {
      setIngredients([...ingredients, inputIngredient.toLowerCase().trim()]);
    }
    
    setInputIngredient("");
  };

  // Handle removing an ingredient
  const handleRemoveIngredient = (ingredientToRemove) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  // Recipe matching function
  const findMatchingRecipes = useCallback(() => {
    if (ingredients.length === 0) {
      setMatchedRecipes([]);
      return;
    }

    const matches = recipes.filter(recipe =>
      ingredients.every(ingredient =>
        recipe.ingredients.some(recipeIngredient =>
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
        )
      )
    );
    setMatchedRecipes(matches);
  }, [ingredients]);

  // Handle recipe selection
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // Clear recipe selection
  const handleClearRecipe = () => {
    setSelectedRecipe(null);
  };

  // Add recipe as a meal
  const handleAddRecipeAsMeal = (recipe) => {
    const newMeal = {
      id: Date.now(),
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      time: "",
      date: selectedDate,
      notes: `Recipe ingredients: ${recipe.ingredients.join(", ")}`
    };
    
    setMeals(prev => [...prev, newMeal]);
    setSelectedRecipe(null);
    alert(`${recipe.name} added to your meals for today!`);
  };
  
  // Handle meal form input changes
  const handleMealInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMeal(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add/Edit meal
  const handleSaveMeal = () => {
    if (!currentMeal.name || !currentMeal.calories) {
      alert("Please provide at least a meal name and calories.");
      return;
    }
    
    // Create new meal or update existing one
    if (currentMeal.id) {
      // Update existing meal
      setMeals(prev => prev.map(meal => 
        meal.id === currentMeal.id ? { ...currentMeal } : meal
      ));
    } else {
      // Add new meal with ID
      const newMeal = {
        ...currentMeal,
        id: Date.now()
      };
      setMeals(prev => [...prev, newMeal]);
    }
    
    // Reset form and close modal
    setCurrentMeal({
      id: null,
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      time: "",
      date: selectedDate,
      notes: ""
    });
    setShowMealModal(false);
  };
  
  // Delete meal
  const handleDeleteMeal = (id) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
  };
  
  // Edit meal
  const handleEditMeal = (meal) => {
    setCurrentMeal({ ...meal });
    setShowMealModal(true);
  };
  
  // Handle water intake
  const adjustWaterIntake = (amount) => {
    // Don't allow negative water intake
    const newAmount = Math.max(0, waterIntake + amount);
    setWaterIntake(newAmount);
  };
  
  // Handle nutritional goals changes
  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setNutritionalGoals(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };
  
  // Save nutritional goals
  const handleSaveGoals = () => {
    setShowGoalModal(false);
  };
  
  // Get meals for the selected date
  const getMealsForDate = () => {
    return meals.filter(meal => meal.date === selectedDate);
  };
  
  // Calculate total nutrients for the day
  const calculateDailyTotals = () => {
    const mealsForToday = getMealsForDate();
    return mealsForToday.reduce((total, meal) => {
      return {
        calories: total.calories + Number(meal.calories || 0),
        protein: total.protein + Number(meal.protein || 0),
        carbs: total.carbs + Number(meal.carbs || 0),
        fat: total.fat + Number(meal.fat || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    // Create a date object with the date string and ensure proper timezone handling
    // This fixes potential timezone offset issues by creating a date object with the date parts
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Calculate percentage of goal
  const calculatePercentage = (current, goal) => {
    if (!goal) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  const dailyTotals = calculateDailyTotals();
  
  return (
    <div className="nutrition-container">
      <div className="nutrition-header">
        <h1>Nutrition Dashboard</h1>
        <p>Plan your meals, track your water intake, and monitor your nutritional goals</p>
      </div>
      
      <div className="nutrition-nav">
        <button 
          className={`tab-button ${activeTab === 'meals' ? 'active' : ''}`} 
          onClick={() => setActiveTab('meals')}
        >
          <FontAwesomeIcon icon={faUtensils} /> Meal Planning
        </button>
        <button 
          className={`tab-button ${activeTab === 'water' ? 'active' : ''}`} 
          onClick={() => setActiveTab('water')}
        >
          <FontAwesomeIcon icon={faTint} /> Water Intake
        </button>
        <button 
          className={`tab-button ${activeTab === 'macros' ? 'active' : ''}`} 
          onClick={() => setActiveTab('macros')}
        >
          <FontAwesomeIcon icon={faChartPie} /> Macro Tracking
        </button>
        <button 
          className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`} 
          onClick={() => setActiveTab('recipes')}
        >
          <FontAwesomeIcon icon={faLeaf} /> Recipe Finder
        </button>
        <button 
          className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`} 
          onClick={() => setActiveTab('goals')}
        >
          <FontAwesomeIcon icon={faBullseye} /> Nutritional Goals
        </button>
      </div>
      
      <div className="nutrition-content">
        {activeTab === 'meals' && (
          <div className="meals-tab">
            <div className="date-selector">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
              <h3>{formatDate(selectedDate)}</h3>
            </div>
            
            <div className="meals-header">
              <h2>Your Meals</h2>
              <button className="add-meal-btn" onClick={() => setShowMealModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> Add Meal
              </button>
            </div>
            
            <div className="meals-list">
              {getMealsForDate().length > 0 ? (
                getMealsForDate().map(meal => (
                  <div key={meal.id} className="meal-item">
                    <div className="meal-header">
                      <h3>{meal.name}</h3>
                      <span className="meal-time">{meal.time || 'No time set'}</span>
                    </div>
                    <div className="meal-details">
                      <p><strong>Calories:</strong> {meal.calories}</p>
                      <p><strong>Protein:</strong> {meal.protein}g</p>
                      <p><strong>Carbs:</strong> {meal.carbs}g</p>
                      <p><strong>Fat:</strong> {meal.fat}g</p>
                    </div>
                    {meal.notes && <p className="meal-notes">{meal.notes}</p>}
                    <div className="meal-actions">
                      <button className="edit-btn" onClick={() => handleEditMeal(meal)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-meals">
                  <FontAwesomeIcon icon={faUtensils} size="3x" />
                  <p>No meals logged for this day.</p>
                  <button onClick={() => setShowMealModal(true)}>Add Your First Meal</button>
                </div>
              )}
            </div>
            
            <div className="daily-summary">
              <h3>Daily Nutrition Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <p>Calories</p>
                  <p className="stat-value">{dailyTotals.calories} / {nutritionalGoals.caloriesGoal}</p>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${calculatePercentage(dailyTotals.calories, nutritionalGoals.caloriesGoal)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat">
                  <p>Protein</p>
                  <p className="stat-value">{dailyTotals.protein}g / {nutritionalGoals.proteinGoal}g</p>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${calculatePercentage(dailyTotals.protein, nutritionalGoals.proteinGoal)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat">
                  <p>Carbs</p>
                  <p className="stat-value">{dailyTotals.carbs}g / {nutritionalGoals.carbsGoal}g</p>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${calculatePercentage(dailyTotals.carbs, nutritionalGoals.carbsGoal)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="stat">
                  <p>Fat</p>
                  <p className="stat-value">{dailyTotals.fat}g / {nutritionalGoals.fatGoal}g</p>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${calculatePercentage(dailyTotals.fat, nutritionalGoals.fatGoal)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'water' && (
          <div className="water-tab">
            <h2>Daily Water Intake</h2>
            <div className="water-container">
              <div className="water-tracker">
                <div 
                  className="water-level animate" 
                  style={{ height: `${(waterIntake / waterGoal) * 100}%` }}
                ></div>
                <div className="water-stats">
                  <p className="water-amount">{waterIntake} / {waterGoal}</p>
                  <p>cups</p>
                </div>
              </div>
              <div className="water-controls">
                <button className="water-btn add" onClick={() => adjustWaterIntake(1)}>
                  <FontAwesomeIcon icon={faPlus} /> Add Cup
                </button>
                <button className="water-btn remove" onClick={() => adjustWaterIntake(-1)}>
                  <FontAwesomeIcon icon={faMinus} /> Remove Cup
                </button>
                <div className="water-goal-setting">
                  <label>Daily Goal (cups):</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={waterGoal} 
                    onChange={(e) => setWaterGoal(Number(e.target.value))} 
                  />
                </div>
              </div>
            </div>
            <div className="water-tips">
              <h3>Hydration Tips</h3>
              <ul>
                <li>Drink a glass of water as soon as you wake up</li>
                <li>Carry a water bottle with you throughout the day</li>
                <li>Set reminders to drink water every hour</li>
                <li>Drink water before, during, and after exercise</li>
                <li>Eat water-rich foods like cucumbers, watermelon, and oranges</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'macros' && (
          <div className="macros-tab">
            <h2>Macro Nutrients Tracking</h2>
            <div className="macro-chart">
              <div className="macro-donut">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  {/* Protein */}
                  <path 
                    className="circle protein"
                    strokeDasharray={`${(dailyTotals.protein / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Carbs */}
                  <path 
                    className="circle carbs"
                    strokeDasharray={`${(dailyTotals.carbs / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100}, 100`}
                    strokeDashoffset={`${-1 * (dailyTotals.protein / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100}`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Fat */}
                  <path 
                    className="circle fat"
                    strokeDasharray={`${(dailyTotals.fat / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100}, 100`}
                    strokeDashoffset={`${-1 * ((dailyTotals.protein + dailyTotals.carbs) / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100}`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <div className="macro-legend">
                <div className="legend-item protein">
                  <span className="color-box"></span>
                  <span>Protein: {dailyTotals.protein}g ({Math.round((dailyTotals.protein / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100) || 0}%)</span>
                </div>
                <div className="legend-item carbs">
                  <span className="color-box"></span>
                  <span>Carbs: {dailyTotals.carbs}g ({Math.round((dailyTotals.carbs / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100) || 0}%)</span>
                </div>
                <div className="legend-item fat">
                  <span className="color-box"></span>
                  <span>Fat: {dailyTotals.fat}g ({Math.round((dailyTotals.fat / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat)) * 100) || 0}%)</span>
                </div>
              </div>
            </div>
            
            <div className="macro-breakdown">
              <h3>Daily Macronutrient Breakdown</h3>
              <div className="breakdown-stats">
                <div className="breakdown-item">
                  <h4>Total Calories</h4>
                  <p>{dailyTotals.calories} kcal</p>
                </div>
                <div className="breakdown-item">
                  <h4>Protein</h4>
                  <p>{dailyTotals.protein}g ({Math.round(dailyTotals.protein * 4)} kcal)</p>
                  <div className="progress-bar">
                    <div 
                      className="progress protein" 
                      style={{ width: `${calculatePercentage(dailyTotals.protein, nutritionalGoals.proteinGoal)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <h4>Carbohydrates</h4>
                  <p>{dailyTotals.carbs}g ({Math.round(dailyTotals.carbs * 4)} kcal)</p>
                  <div className="progress-bar">
                    <div 
                      className="progress carbs" 
                      style={{ width: `${calculatePercentage(dailyTotals.carbs, nutritionalGoals.carbsGoal)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <h4>Fat</h4>
                  <p>{dailyTotals.fat}g ({Math.round(dailyTotals.fat * 9)} kcal)</p>
                  <div className="progress-bar">
                    <div 
                      className="progress fat" 
                      style={{ width: `${calculatePercentage(dailyTotals.fat, nutritionalGoals.fatGoal)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'recipes' && (
          <div className="recipes-tab">
            <h2>Recipe Finder</h2>
            <p className="recipes-intro">Enter ingredients you have on hand to discover healthy meals you can make.</p>
            
            <div className="ingredients-input-container">
              <div className="ingredients-input">
                <input
                  type="text"
                  value={inputIngredient}
                  onChange={(e) => setInputIngredient(e.target.value)}
                  placeholder="Enter an ingredient (e.g., chicken, broccoli)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                />
                <button 
                  className="add-ingredient-btn"
                  onClick={handleAddIngredient}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>
              </div>

              <div className="ingredients-list">
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-tag">
                      {ingredient}
                      <button 
                        className="remove-ingredient-btn" 
                        onClick={() => handleRemoveIngredient(ingredient)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-ingredients">No ingredients added yet.</p>
                )}
              </div>
            </div>

            {ingredients.length > 0 && (
              <div className="recipes-container">
                {selectedRecipe ? (
                  <div className="recipe-detail">
                    <button 
                      className="back-to-recipes-btn" 
                      onClick={handleClearRecipe}
                    >
                      Back to recipes
                    </button>
                    
                    <h3>{selectedRecipe.name}</h3>
                    
                    <div className="recipe-detail-content">
                      <div className="recipe-image">
                        <img 
                          src={selectedRecipe.image} 
                          alt={selectedRecipe.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      </div>
                      
                      <div className="recipe-info">
                        <div className="recipe-stats">
                          <div className="recipe-stat">
                            <span>Calories</span>
                            <span>{selectedRecipe.calories} kcal</span>
                          </div>
                          <div className="recipe-stat">
                            <span>Protein</span>
                            <span>{selectedRecipe.protein}g</span>
                          </div>
                          <div className="recipe-stat">
                            <span>Carbs</span>
                            <span>{selectedRecipe.carbs}g</span>
                          </div>
                          <div className="recipe-stat">
                            <span>Fat</span>
                            <span>{selectedRecipe.fat}g</span>
                          </div>
                          <div className="recipe-stat">
                            <span>Prep Time</span>
                            <span>{selectedRecipe.prepTime}</span>
                          </div>
                        </div>
                        
                        <div className="recipe-ingredients">
                          <h4>Ingredients</h4>
                          <ul>
                            {selectedRecipe.ingredients.map((ingredient, index) => (
                              <li key={index} className={ingredients.some(i => 
                                ingredient.toLowerCase().includes(i.toLowerCase()) || 
                                i.toLowerCase().includes(ingredient.toLowerCase())
                              ) ? 'available' : ''}>
                                {ingredient}
                                {ingredients.some(i => 
                                  ingredient.toLowerCase().includes(i.toLowerCase()) || 
                                  i.toLowerCase().includes(ingredient.toLowerCase())
                                ) && <span className="ingredient-available">✓</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="recipe-instructions">
                          <h4>Instructions</h4>
                          <p>{selectedRecipe.instructions}</p>
                        </div>
                        
                        <button 
                          className="add-recipe-meal-btn" 
                          onClick={() => handleAddRecipeAsMeal(selectedRecipe)}
                        >
                          <FontAwesomeIcon icon={faUtensils} /> Add to My Meals
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="recipes-results">
                    <h3>
                      {matchedRecipes.length > 0 
                        ? 'Recipes you can make:' 
                        : 'No matching recipes found'}
                    </h3>
                    
                    <div className="recipes-grid">
                      {matchedRecipes.map(recipe => (
                        <div 
                          key={recipe.id} 
                          className="recipe-card" 
                          onClick={() => handleSelectRecipe(recipe)}
                        >
                          <div className="recipe-card-image">
                            <img 
                              src={recipe.image} 
                              alt={recipe.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                            <div className="recipe-match-percentage">
                              <span>{calculatePercentage(recipe.calories, nutritionalGoals.caloriesGoal)}%</span> match
                            </div>
                          </div>
                          <div className="recipe-card-content">
                            <h4>{recipe.name}</h4>
                            <p className="recipe-card-ingredients">
                              {recipe.ingredients.length} ingredients
                              <span className="recipe-card-prep">
                                | {recipe.prepTime}
                              </span>
                            </p>
                            <div className="recipe-card-tags">
                              {recipe.tags.map((tag, index) => (
                                <span key={index} className="recipe-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div className="goals-tab">
            <h2>Nutritional Goals</h2>
            <div className="goals-container">
              <div className="current-goals">
                <h3>Your Current Goals</h3>
                <div className="goal-item">
                  <span>Daily Calorie Target:</span>
                  <span>{nutritionalGoals.caloriesGoal} kcal</span>
                </div>
                <div className="goal-item">
                  <span>Protein Target:</span>
                  <span>{nutritionalGoals.proteinGoal}g</span>
                </div>
                <div className="goal-item">
                  <span>Carbohydrates Target:</span>
                  <span>{nutritionalGoals.carbsGoal}g</span>
                </div>
                <div className="goal-item">
                  <span>Fat Target:</span>
                  <span>{nutritionalGoals.fatGoal}g</span>
                </div>
                <button className="edit-goals-btn" onClick={() => setShowGoalModal(true)}>
                  Edit Goals
                </button>
              </div>
              
              <div className="goals-info">
                <h3>About Nutritional Goals</h3>
                <p>Setting proper nutritional goals is essential for achieving your fitness objectives. Your goals should align with your specific fitness journey, whether you&apos;re looking to lose weight, gain muscle, or maintain overall health.</p>
                <h4>General Guidelines:</h4>
                <ul>
                  <li>Protein: 0.8-1.2g per pound of body weight (higher for muscle building)</li>
                  <li>Carbs: 3-5g per pound of body weight (adjust based on activity level)</li>
                  <li>Fat: 0.3-0.5g per pound of body weight (important for hormonal health)</li>
                </ul>
                <p>For weight loss, focus on a moderate calorie deficit. For muscle gain, prioritize protein intake and a calorie surplus. For maintenance, balance your macros to match your activity level.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Meal Modal */}
      {showMealModal && (
        <div className="modal-overlay">
          <div className="meal-modal">
            <div className="modal-header">
              <h3>{currentMeal.id ? "Edit Meal" : "Add New Meal"}</h3>
              <button className="close-btn" onClick={() => setShowMealModal(false)}>×</button>
            </div>
            
            <div className="meal-form">
              <div className="form-group">
                <label>Meal Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={currentMeal.name} 
                  onChange={handleMealInputChange} 
                  placeholder="e.g., Breakfast, Lunch, Snack..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={currentMeal.date} 
                    onChange={handleMealInputChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    value={currentMeal.time} 
                    onChange={handleMealInputChange} 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Calories</label>
                  <input 
                    type="number" 
                    name="calories" 
                    value={currentMeal.calories} 
                    onChange={handleMealInputChange} 
                    placeholder="kcal"
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Protein (g)</label>
                  <input 
                    type="number" 
                    name="protein" 
                    value={currentMeal.protein} 
                    onChange={handleMealInputChange} 
                    placeholder="grams"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Carbs (g)</label>
                  <input 
                    type="number" 
                    name="carbs" 
                    value={currentMeal.carbs} 
                    onChange={handleMealInputChange} 
                    placeholder="grams"
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Fat (g)</label>
                  <input 
                    type="number" 
                    name="fat" 
                    value={currentMeal.fat} 
                    onChange={handleMealInputChange} 
                    placeholder="grams"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  name="notes" 
                  value={currentMeal.notes} 
                  onChange={handleMealInputChange} 
                  placeholder="Any additional details..."
                ></textarea>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowMealModal(false)}>Cancel</button>
              {currentMeal.id && (
                <button className="delete-btn" onClick={() => {
                  handleDeleteMeal(currentMeal.id);
                  setShowMealModal(false);
                }}>
                  Delete
                </button>
              )}
              <button className="save-btn" onClick={handleSaveMeal}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Goals Modal */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="goals-modal">
            <div className="modal-header">
              <h3>Edit Nutritional Goals</h3>
              <button className="close-btn" onClick={() => setShowGoalModal(false)}>×</button>
            </div>
            
            <div className="goals-form">
              <div className="form-group">
                <label>Daily Calorie Target (kcal)</label>
                <input 
                  type="number" 
                  name="caloriesGoal" 
                  value={nutritionalGoals.caloriesGoal} 
                  onChange={handleGoalChange} 
                  min="1000"
                  max="5000"
                />
              </div>
              
              <div className="form-group">
                <label>Protein Target (g)</label>
                <input 
                  type="number" 
                  name="proteinGoal" 
                  value={nutritionalGoals.proteinGoal} 
                  onChange={handleGoalChange} 
                  min="10"
                  max="300"
                />
              </div>
              
              <div className="form-group">
                <label>Carbohydrates Target (g)</label>
                <input 
                  type="number" 
                  name="carbsGoal" 
                  value={nutritionalGoals.carbsGoal} 
                  onChange={handleGoalChange} 
                  min="10"
                  max="500"
                />
              </div>
              
              <div className="form-group">
                <label>Fat Target (g)</label>
                <input 
                  type="number" 
                  name="fatGoal" 
                  value={nutritionalGoals.fatGoal} 
                  onChange={handleGoalChange} 
                  min="10"
                  max="200"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveGoals}>Save Goals</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition; 