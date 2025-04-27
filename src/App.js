import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore'; // Import addDoc, deleteDoc, updateDoc, orderBy

// Assume Tailwind CSS is included via CDN in the surrounding HTML or compiled
// <script src="https://cdn.tailwindcss.com"></script>

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDckbiZIwbBujJAhovQhGQiL_SQReBWDu0",
  authDomain: "millionaire-mentor-dashboard.firebaseapp.com",
  projectId: "millionaire-mentor-dashboard",
  storageBucket: "millionaire-mentor-dashboard.firebasestorage.app",
  messagingSenderId: "197110069768",
  appId: "1:197110069768:web:4ad8808c96a99c785cefbd",
  measurementId: "G-HX97C4LNLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper component for a standard card layout
const DashboardCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
    <h3 className="text-lg font-bold text-[#333333] mb-4">{title}</h3>
    {children}
  </div>
);

// Authentication Component (Login/Signup)
const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess(); // Callback to indicate successful login/signup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-[#F7F6F3] min-h-screen flex items-center justify-center">
      <DashboardCard title={isLogin ? "Login" : "Sign Up"}>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleAuth}
          className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 w-full mb-4"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#005F99] hover:underline text-sm w-full"
        >
          Switch to {isLogin ? "Sign Up" : "Login"}
        </button>
      </DashboardCard>
    </div>
  );
};


// Goals Wizard - Now saves to Firebase
const GoalsWizard = ({ userId, onGoalsSet }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      // Save goal to Firestore in a 'goals' collection under the user's ID
      await setDoc(doc(db, 'users', userId, 'goals', 'myGoal'), {
        fourYearNetWorthGoal: parseFloat(goal),
        createdAt: new Date(),
      });
      console.log('Goal set successfully!');
      onGoalsSet(); // Callback to hide wizard and show dashboard
    } catch (error) {
      console.error("Error setting goal: ", error);
      alert("Failed to set goal. Please try again."); // Use a modal in a real app
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F7F6F3] min-h-screen flex items-center justify-center">
      <DashboardCard title="Set Your 4-Year Net Worth Goal">
        <p className="text-[#333333] mb-4">Let's define your target to break it down into actionable steps.</p>
        <input
          type="number"
          placeholder="Enter your goal (e.g., 1,000,000)"
          className="w-full p-2 mb-4 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          disabled={loading || !goal}
        >
          {loading ? 'Setting Goal...' : 'Set Goal'}
        </button>
      </DashboardCard>
    </div>
  );
};

// Placeholder for the Milestone Roadmap UI
const MilestoneRoadmap = ({ userId }) => {
   // This would fetch roadmap data from the backend (or Firestore)
   // For now, using static data as placeholder
  const milestones = [
    { id: 1, quarter: 'Q1 2025', goal: '$10k Net Worth', status: 'in progress' },
    { id: 2, quarter: 'Q2 2025', goal: '$25k Net Worth', status: 'not started' },
    { id: 3, quarter: 'Q3 2025', goal: '$50k Net Worth', status: 'not started' },
    // ... more milestones fetched from Firebase
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'not started': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-[#333333] mb-4">Roadmap</h2>
      <div className="space-y-4">
        {milestones.map(milestone => (
          <div key={milestone.id} className={`p-3 rounded-md shadow-sm ${getStatusColor(milestone.status)} text-white`}>
            <p className="font-bold">{milestone.quarter}</p>
            <p className="text-sm">{milestone.goal}</p>
            {/* Drag-and-drop functionality would be added here */}
          </div>
        ))}
      </div>
    </div>
  );
};

// Weekly Action Cards - Fully working with Firebase
const WeeklyActionCards = ({ userId }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [addError, setAddError] = useState(null);

  // Fetch actions from Firestore on component mount
  useEffect(() => {
    const fetchActions = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const actionsCollectionRef = collection(db, 'users', userId, 'actions');
        // Order by due date
        const q = query(actionsCollectionRef, orderBy('dueDate'));
        const actionsSnapshot = await getDocs(q);
        const actionsData = actionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate ? doc.data().dueDate.toDate().toISOString().split('T')[0] : '', // Convert Timestamp toYYYY-MM-DD
        }));
        setActions(actionsData);
        setAddError(null);
      } catch (error) {
        console.error("Error fetching actions: ", error);
        setAddError("Failed to load actions.");
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [userId]); // Refetch if userId changes

  // Handle marking an action as complete/incomplete
  const handleCheck = async (id, currentCompletedStatus) => {
    const actionToUpdate = actions.find(action => action.id === id);
    if (!actionToUpdate) return;

    const newCompletedStatus = !currentCompletedStatus;

    // Optimistically update local state
    setActions(actions.map(action =>
      action.id === id ? { ...action, completed: newCompletedStatus } : action
    ));

    // Update action in Firestore
    const actionDocRef = doc(db, 'users', userId, 'actions', id);
    try {
      await updateDoc(actionDocRef, {
        completed: newCompletedStatus,
        completedAt: newCompletedStatus ? new Date() : null, // Track completion date
      });
      console.log(`Action ${id} completion status updated in Firestore`);
      setAddError(null); // Clear any errors on successful update
    } catch (error) {
      console.error("Error updating action: ", error);
      // Revert local state if Firestore update fails
      setActions(actions.map(action =>
        action.id === id ? { ...action, completed: currentCompletedStatus } : action // Revert to original status
      ));
      setAddError("Failed to update action status. Please try again."); // Set error state
    }
  };

  // Add a new action
  const addAction = async () => {
    if (!userId || !newActionTitle.trim() || !newActionDueDate) {
      setAddError("Please fill out Title and Due Date.");
      return;
    }

    setAddError(null);

    const newAction = {
      title: newActionTitle.trim(),
      description: newActionDescription.trim(),
      dueDate: new Date(newActionDueDate), // Store as Firestore Timestamp
      completed: false,
      createdAt: new Date(),
      completedAt: null,
      // dependency: null, // Placeholder for dependency
    };

    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'actions'), newAction);
      // Add the new action to local state (convert date back for local display)
      setActions([...actions, {
        id: docRef.id,
        ...newAction,
        dueDate: newAction.dueDate.toISOString().split('T')[0],
      }]); // Add to the end, or re-fetch/sort if needed
      setNewActionTitle('');
      setNewActionDescription('');
      setNewActionDueDate('');
      console.log("New action added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding action: ", error);
      setAddError("Failed to add action. Please try again.");
    }
  };

  // Placeholder for Edit Action functionality (Similar to Habit editing)
  const startEditingAction = (action) => {
      // Implement state and UI for editing actions
      alert("Edit Action functionality not fully implemented yet."); // Replace with actual modal/form
  };

  // Placeholder for Delete Action functionality (Similar to Habit deleting)
  const deleteAction = async (id) => {
      if (window.confirm("Are you sure you want to delete this action?")) {
          const actionDocRef = doc(db, 'users', userId, 'actions', id);
          try {
              await deleteDoc(actionDocRef);
              setActions(actions.filter(action => action.id !== id));
              console.log(`Action ${id} deleted`);
          } catch (error) {
              console.error("Error deleting action: ", error);
              setAddError("Failed to delete action.");
          }
      }
  };


  if (loading) {
    return <DashboardCard title="Weekly Actions">Loading actions...</DashboardCard>;
  }

  return (
    <DashboardCard title="Weekly Actions">
       {/* Form to Add New Action */}
       <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="font-semibold mb-3 text-[#333333]">Add New Action</h4>
            <div className="grid grid-cols-1 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Action Title"
                    className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                />
                 <textarea
                    placeholder="Description (Optional)"
                    className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
                    rows="2"
                    value={newActionDescription}
                    onChange={(e) => setNewActionDescription(e.target.value)}
                ></textarea>
                <input
                    type="date"
                    className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                />
                {/* Placeholder for Dependency selection */}
                {/* <select className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md">
                    <option value="">Select Dependency (Optional)</option>
                </select> */}
            </div>
            {addError && <p className="text-red-500 text-sm mb-4">{addError}</p>}
            <button
                onClick={addAction}
                className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm disabled:opacity-50"
                disabled={!newActionTitle.trim() || !newActionDueDate}
            >
                Add Action
            </button>
       </div>


      <div className="space-y-4">
        {actions.length === 0 ? (
            <p className="text-gray-600">No weekly actions added yet.</p>
        ) : (
            actions.map(action => (
              <div key={action.id} className={`flex items-start p-3 border rounded-md ${action.completed ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}`}>
                <input
                  type="checkbox"
                  checked={action.completed}
                  onChange={() => handleCheck(action.id, action.completed)}
                  className="mr-3 mt-1 h-5 w-5 text-[#005F99] rounded focus:ring-[#005F99]"
                  // Disable checkbox if dependency is not met (basic check)
                  // disabled={action.dependency && !actions.find(a => a.id === action.dependency)?.completed && !action.completed}
                />
                <div className="flex-grow">
                  <p className={`font-bold text-[#333333] ${action.completed ? 'line-through' : ''}`}>{action.title}</p>
                  {action.description && <p className={`text-sm text-gray-600 ${action.completed ? 'line-through' : ''}`}>{action.description}</p>}
                  <p className="text-xs text-gray-500">Due by: {action.dueDate}</p>
                   {/* Display dependency if exists (placeholder) */}
                   {/* {action.dependency && (
                       <p className="text-xs text-yellow-700 mt-1">Blocked by: {actions.find(a => a.id === action.dependency)?.title || 'Unknown Action'}</p>
                   )} */}
                </div>
                 <div className="flex items-center ml-4"> {/* Action buttons */}
                    <button
                        onClick={() => startEditingAction(action)}
                        className="text-blue-500 hover:text-blue-700 text-sm p-1 rounded-md hover:bg-gray-100 mr-1"
                        title="Edit Action"
                    >
                         {/* Edit Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => deleteAction(action.id)}
                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded-md hover:bg-gray-100"
                        title="Delete Action"
                    >
                         {/* Delete Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </div>
              </div>
            ))
        )}
      </div>
    </DashboardCard>
  );
};

// Daily Habit Tracker - Now saves to Firebase with Edit/Delete and improved UI
const DailyHabitTracker = ({ userId }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState(''); // State for new habit input
  const [addError, setAddError] = useState(null); // State to track add habit errors
  const [editingHabitId, setEditingHabitId] = useState(null); // State to track which habit is being edited
  const [editingHabitName, setEditingHabitName] = useState(''); // State for the input value when editing

  // Fetch habits from Firestore on component mount
  useEffect(() => {
    const fetchHabits = async () => {
      if (!userId) return;
      setLoading(true); // Set loading true before fetching
      try {
        const habitsCollectionRef = collection(db, 'users', userId, 'habits');
        const habitsSnapshot = await getDocs(habitsCollectionRef);
        const habitsData = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHabits(habitsData);
        setAddError(null); // Clear any previous errors on successful fetch
      } catch (error) {
        console.error("Error fetching habits: ", error);
        // Optionally show an error message to the user for fetching
        setAddError("Failed to load habits."); // Set error state for fetching
      } finally {
        setLoading(false); // Set loading false after fetching
      }
    };

    fetchHabits();
  }, [userId]); // Refetch if userId changes

  const handleCheck = async (id) => {
    const habitToUpdate = habits.find(habit => habit.id === id);
    if (!habitToUpdate) return;

    const newCheckedStatus = !habitToUpdate.checked;
    // Simple streak logic: increment if checked, reset if unchecked
    const newStreak = newCheckedStatus ? habitToUpdate.streak + 1 : 0;

    // Optimistically update local state
    setHabits(habits.map(habit =>
        habit.id === id ? { ...habit, checked: newCheckedStatus, streak: newStreak } : habit
    ));

    // Update habit in Firestore
    const habitDocRef = doc(db, 'users', userId, 'habits', id);
    try {
      await updateDoc(habitDocRef, {
        checked: newCheckedStatus,
        streak: newStreak,
        lastChecked: newCheckedStatus ? new Date() : null, // Track last checked date
      });
      console.log(`Habit ${id} updated in Firestore`);
      setAddError(null); // Clear any add errors on successful update
    } catch (error) {
      console.error("Error updating habit: ", error);
      // Revert local state if Firestore update fails
      setHabits(habits.map(habit =>
          habit.id === id ? { ...habit, checked: !newCheckedStatus, streak: habitToUpdate.streak } : habit // Revert to original streak
      ));
      // Set a specific error state for updating if needed, or reuse addError
      setAddError("Failed to update habit. Please try again."); // Set error state
    }
  };

  // Add a new habit - now uses input field and specific error state
  const addHabit = async () => {
      if (!userId || !newHabitName.trim()) {
          setAddError("Please enter a habit name.");
          return;
      }

      setAddError(null); // Clear previous errors before attempting to add

      const newHabit = {
          name: newHabitName.trim(), // Use name from input
          checked: false,
          streak: 0,
          createdAt: new Date(),
          lastChecked: null,
      };

      try {
          // Use addDoc to add a new document with an auto-generated ID
          const docRef = await addDoc(collection(db, 'users', userId, 'habits'), newHabit);
          // Add the new habit to local state with the Firestore ID
          setHabits([...habits, { id: docRef.id, ...newHabit }]);
          setNewHabitName(''); // Clear the input field
          console.log("New habit added with ID: ", docRef.id);
          // No alert here on success
      } catch (error) {
          console.error("Error adding habit: ", error);
          setAddError("Failed to add habit. Please try again."); // Set error state
      }
  };

  // Start editing a habit
  const startEditing = (habit) => {
      setEditingHabitId(habit.id);
      setEditingHabitName(habit.name);
  };

  // Cancel editing
  const cancelEditing = () => {
      setEditingHabitId(null);
      setEditingHabitName('');
      setAddError(null); // Clear error on cancel
  };

  // Save edited habit
  const saveEditedHabit = async (id) => {
      if (!editingHabitName.trim()) {
          setAddError("Habit name cannot be empty.");
          return;
      }

      setAddError(null); // Clear previous errors

      const habitDocRef = doc(db, 'users', userId, 'habits', id);
      try {
          await updateDoc(habitDocRef, {
              name: editingHabitName.trim(),
          });
          // Update local state
          setHabits(habits.map(habit =>
              habit.id === id ? { ...habit, name: editingHabitName.trim() } : habit
          ));
          console.log(`Habit ${id} updated in Firestore`);
          cancelEditing(); // Exit editing mode
      } catch (error) {
          console.error("Error saving edited habit: ", error);
          setAddError("Failed to save habit. Please try again."); // Set error state
      }
  };

  // Delete a habit
  const deleteHabit = async (id) => {
      // Optional: Add a confirmation modal here
      if (window.confirm("Are you sure you want to delete this habit?")) {
          const habitDocRef = doc(db, 'users', userId, 'habits', id);
          try {
              await deleteDoc(habitDocRef);
              // Update local state by removing the deleted habit
              setHabits(habits.filter(habit => habit.id !== id));
              console.log(`Habit ${id} deleted from Firestore`);
              setAddError(null); // Clear any errors
          } catch (error) {
              console.error("Error deleting habit: ", error);
              setAddError("Failed to delete habit. Please try again."); // Set error state
          }
      }
  };


  if (loading) {
      return <DashboardCard title="Daily Habits">Loading habits...</DashboardCard>;
  }

  return (
    <DashboardCard title="Daily Habits">
      <div className="space-y-3 mb-4"> {/* Added mb-4 for spacing below list */}
        {habits.length === 0 ? (
            <p className="text-gray-600">No habits added yet. Add one to get started!</p>
        ) : (
            habits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"> {/* Added padding and border */}
                {editingHabitId === habit.id ? (
                    // Edit mode
                    <div className="flex items-center flex-grow mr-2">
                        <input
                            type="text"
                            value={editingHabitName}
                            onChange={(e) => setEditingHabitName(e.target.value)}
                            className="flex-grow p-1 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md" // Added rounded
                            onKeyPress={(e) => { if (e.key === 'Enter') saveEditedHabit(habit.id); }} // Save on Enter
                        />
                         <button
                            onClick={() => saveEditedHabit(habit.id)}
                            className="ml-2 text-green-600 hover:text-green-800 text-sm p-1 rounded-md hover:bg-gray-100" // Added padding and hover effect
                            title="Save"
                        >
                            {/* Save Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M0 2C0 .9.9 0 2 0h14l4 4v14c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V2zm5 0v5h10V2H5zm0 8v8h10v-8H5z"/>
                            </svg>
                        </button>
                        <button
                            onClick={cancelEditing}
                            className="ml-2 text-gray-500 hover:text-gray-700 text-sm p-1 rounded-md hover:bg-gray-100" // Added padding and hover effect
                            title="Cancel"
                        >
                            {/* Cancel Icon (e.g., Close) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    // Display mode
                    <label className="flex items-center flex-grow cursor-pointer"> {/* Made label clickable */}
                      <input
                        type="checkbox"
                        checked={habit.checked}
                        onChange={() => handleCheck(habit.id)}
                        className="mr-3 h-5 w-5 text-[#005F99] rounded focus:ring-[#005F99]"
                      />
                      <span className={`text-[#333333] ${habit.checked ? 'line-through' : ''}`}>{habit.name}</span>
                    </label>
                )}
                {/* Streak and Action Buttons (Always Visible) */}
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3">{habit.streak} day streak 🔥</span>
                    {editingHabitId !== habit.id && ( // Hide edit/delete buttons while editing
                        <>
                            <button
                                onClick={() => startEditing(habit)}
                                className="text-blue-500 hover:text-blue-700 text-sm p-1 rounded-md hover:bg-gray-100 mr-1" // Added padding and hover effect, margin-right
                                title="Edit Habit"
                            >
                                {/* Edit Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => deleteHabit(habit.id)}
                                className="text-red-500 hover:text-red-700 text-sm p-1 rounded-md hover:bg-gray-100" // Added padding and hover effect
                                title="Delete Habit"
                            >
                                {/* Delete Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Input and button for adding new habits */}
      <div className="flex items-center mt-4"> {/* Added margin-top */}
        <input
          type="text"
          placeholder="Enter new habit name"
          className="flex-grow p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] mr-2 text-sm rounded-md" // Added rounded
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') addHabit(); }} // Allow adding with Enter key
          disabled={editingHabitId !== null} // Disable add input while editing
        />
        <button
          onClick={addHabit}
          className="bg-gray-200 text-[#333333] px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200 text-sm disabled:opacity-50"
          disabled={!newHabitName.trim() || editingHabitId !== null} // Disable if input is empty or editing
        >
          Add Habit
        </button>
      </div>

      {/* Display add habit error if exists */}
      {addError && (
          <p className="text-red-500 text-sm mt-2">{addError}</p>
      )}

      {/* Mentor Tip popup logic would be here */}
    </DashboardCard>
  );
};

// Income/Expense Feed - Fully working with Firebase
const IncomeExpenseFeed = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('income'); // 'income' or 'expense'
  const [transactionDate, setTransactionDate] = useState('');
  const [addError, setAddError] = useState(null);

  // Fetch transactions from Firestore on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
        // Order by date for a chronological feed
        const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
        const transactionsSnapshot = await getDocs(q);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate().toISOString().split('T')[0] // Convert Firestore Timestamp toYYYY-MM-DD
        }));
        setTransactions(transactionsData);
        setAddError(null);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
        setAddError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]); // Refetch if userId changes

  // Calculate net profit
  const netProfit = transactions.reduce((sum, t) => {
    const amountValue = parseFloat(t.amount);
    if (isNaN(amountValue)) return sum; // Skip invalid amounts
    return t.type === 'income' ? sum + amountValue : sum - amountValue;
  }, 0);

  // Add a new transaction
  const addTransaction = async () => {
    if (!userId || !amount || !category.trim() || !type || !transactionDate) {
      setAddError("Please fill out all transaction details.");
      return;
    }

    setAddError(null);

    const newTransaction = {
      amount: parseFloat(amount), // Store as number
      category: category.trim(),
      type: type,
      date: new Date(transactionDate), // Store as Firestore Timestamp
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), newTransaction);
      // Add the new transaction to local state (convert date back for local display)
      // Re-fetch and sort to ensure correct order after adding
      const transactionsCollectionRef = collection(db, 'users', userId, 'transactions');
      const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
      const transactionsSnapshot = await getDocs(q);
      const transactionsData = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString().split('T')[0]
      }));
      setTransactions(transactionsData);

      setAmount('');
      setCategory('');
      setType('income');
      setTransactionDate('');
      console.log("New transaction added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding transaction: ", error);
      setAddError("Failed to add transaction. Please try again.");
    }
  };

    // Delete a transaction (Optional, but good for full functionality)
    const deleteTransaction = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            const transactionDocRef = doc(db, 'users', userId, 'transactions', id);
            try {
                await deleteDoc(transactionDocRef);
                setTransactions(transactions.filter(t => t.id !== id));
                console.log(`Transaction ${id} deleted`);
            } catch (error) {
                console.error("Error deleting transaction: ", error);
                setAddError("Failed to delete transaction.");
            }
        }
    };


  if (loading) {
    return <DashboardCard title="Income/Expense Feed">Loading transactions...</DashboardCard>;
  }

  return (
    <DashboardCard title="Income/Expense Feed">
      <div className="mb-4">
        <p className="text-lg font-bold text-[#333333]">Net Profit: <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{netProfit.toFixed(2)} DH</span></p>
      </div>

      {/* Form to Add New Transaction */}
      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="font-semibold mb-3 text-[#333333]">Add New Transaction</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Amount (DH)"
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <select
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="date"
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>
        {addError && <p className="text-red-500 text-sm mb-4">{addError}</p>}
        <button
          onClick={addTransaction}
          className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm disabled:opacity-50"
          disabled={!amount || !category.trim() || !type || !transactionDate}
        >
          Add Transaction
        </button>
      </div>


      {/* Transaction List */}
      <h4 className="font-semibold mb-3 text-[#333333]">Transaction History</h4>
      <div className="space-y-3 text-sm">
        {transactions.length === 0 ? (
            <p className="text-gray-600">No transactions recorded yet.</p>
        ) : (
            transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"> {/* Added padding and border */}
                <div>
                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)} DH</span>
                    <span className="text-gray-600 ml-2">{t.category}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">{t.date}</span>
                     {/* Delete Button */}
                    <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded-md hover:bg-gray-100" // Added padding and hover effect
                        title="Delete Transaction"
                    >
                         {/* Delete Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
              </div>
            ))
        )}
      </div>
    </DashboardCard>
  );
};


// Placeholder for Skill Hours Log
const SkillHoursLog = ({ userId }) => {
  const [logging, setLogging] = useState(false);
  const [skill, setSkill] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  useEffect(() => {
    let timer;
    if (logging) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [logging, startTime]);

  const startLogging = () => {
    if (skill) {
      setLogging(true);
      setStartTime(Date.now());
      setElapsedTime(0);
    } else {
      alert('Please select a skill first.'); // Use a modal in a real app
    }
  };

  const stopLogging = async () => {
    setLogging(false);
    // Log the time for the selected skill to Firestore
    if (userId && skill && elapsedTime > 0) {
        try {
            await setDoc(doc(collection(db, 'users', userId, 'skillLogs')), {
                skill: skill,
                durationSeconds: elapsedTime,
                timestamp: new Date(),
            });
            console.log(`Logged ${elapsedTime} seconds for ${skill} to Firestore`);
        } catch (error) {
            console.error("Error logging skill hours: ", error);
            alert("Failed to log skill hours. Please try again.");
        }
    }
    setSkill('');
    setElapsedTime(0);
    setStartTime(null);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };


  return (
    <DashboardCard title="Skill Hours Log">
      <div className="flex items-center mb-4">
        <select
          className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] mr-4"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          disabled={logging}
        >
          <option value="">Select Skill</option>
          <option value="Coding">Coding</option>
          <option value="Design">Design</option>
          <option value="English">English</option>
        </select>
        {!logging ? (
          <button
            onClick={startLogging}
            className="bg-[#005F99] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            disabled={!skill}
          >
            Start Timer
          </button>
        ) : (
          <button
            onClick={stopLogging}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            Stop Timer
          </button>
        )}
      </div>
      {logging && (
        <p className="text-lg font-bold text-[#333333]">Logging: {skill} - {formatTime(elapsedTime)}</p>
      )}
      {/* Weekly/Monthly charts would go here, fetching data from Firestore */}
    </DashboardCard>
  );
};

// Placeholder for MVP Test Launcher
const MVPTestLauncher = ({ userId }) => {
  const [hypothesis, setHypothesis] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [results, setResults] = useState(null); // { signups: 0, target: 0, go: false }
  const [loading, setLoading] = useState(false);

  const launchTest = async () => {
    if (!hypothesis || !targetMetric || !adBudget) {
        alert("Please fill out all fields."); // Use a modal
        return;
    }
    setLoading(true);
    // In a real app, this would interact with backend/APIs and potentially Firestore
    console.log('Launching MVP test:', { hypothesis, targetMetric, adBudget });

    // Simulate results after some time
    setTimeout(async () => {
      const simulatedSignups = Math.floor(Math.random() * (parseInt(targetMetric) * 2));
      const goNoGo = simulatedSignups >= parseInt(targetMetric);
      const testResults = {
          hypothesis,
          targetMetric: parseInt(targetMetric),
          adBudget: parseFloat(adBudget),
          signups: simulatedSignups, // Corrected typo here
          go: goNoGo,
          timestamp: new Date(),
      };
      setResults(testResults);
      setLoading(false);

      // Save test results to Firestore
      if (userId) {
          try {
              await setDoc(doc(collection(db, 'users', userId, 'mvpTests')), testResults);
              console.log("MVP test results saved to Firestore");
          } catch (error) {
              console.error("Error saving MVP test results: ", error);
              alert("Failed to save MVP test results.");
          }
      }

    }, 3000); // Simulate a delay
  };

  return (
    <DashboardCard title="MVP Test Launcher">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hypothesis</label>
          <textarea
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
            rows="2"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="e.g., 'Offering X service will attract Y customers'"
            disabled={loading}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Metric (e.g., Sign-ups)</label>
          <input
            type="number"
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
            value={targetMetric}
            onChange={(e) => setTargetMetric(e.target.value)}
            placeholder="e.g., 10"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ad Budget (DH)</label>
          <input
            type="number"
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99]"
            value={adBudget}
            onChange={(e) => setAdBudget(e.target.value)}
            placeholder="e.g., 100"
            disabled={loading}
          />
        </div>
        <button
          onClick={launchTest}
          className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          disabled={loading || !hypothesis || !targetMetric || !adBudget}
        >
          {loading ? 'Launching...' : 'Launch Test'}
        </button>

        {results && (
          <div className={`p-4 rounded-md ${results.go ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-bold">Test Results:</p>
            <p>Sign-ups: {results.signups} / {results.target}</p>
            <p className="mt-2 font-bold">Recommendation: {results.go ? 'Go!' : 'No-Go'}</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

// Personal Brand Feed - Fully working with Firebase
const PersonalBrandFeed = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostPlatform, setNewPostPlatform] = useState('');
  const [newPostDate, setNewPostDate] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState(''); // Optional: for image URLs
  const [addError, setAddError] = useState(null);

  // Fetch posts from Firestore on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const postsCollectionRef = collection(db, 'users', userId, 'personalBrand');
        // Order by date for a chronological feed
        const q = query(postsCollectionRef, orderBy('date', 'desc'));
        const postsSnapshot = await getDocs(q);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString().split('T')[0], // Convert Firestore Timestamp toYYYY-MM-DD
        }));
        setPosts(postsData);
        setAddError(null);
      } catch (error) {
        console.error("Error fetching personal brand posts: ", error);
        setAddError("Failed to load personal brand posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]); // Refetch if userId changes

  // Add a new post
  const addPost = async () => {
    if (!userId || !newPostPlatform.trim() || !newPostDate || !newPostCaption.trim()) {
      setAddError("Please fill out Platform, Date, and Caption.");
      return;
    }

    setAddError(null);

    const newPost = {
      platform: newPostPlatform.trim(),
      date: new Date(newPostDate), // Store as Firestore Timestamp
      caption: newPostCaption.trim(),
      imageUrl: newPostImageUrl.trim(), // Optional
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'personalBrand'), newPost);
      // Add the new post to local state (convert date back for local display)
      // Re-fetch and sort to ensure correct order after adding
      const postsCollectionRef = collection(db, 'users', userId, 'personalBrand');
      const q = query(postsCollectionRef, orderBy('date', 'desc'));
      const postsSnapshot = await getDocs(q);
      const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString().split('T')[0]
      }));
      setPosts(postsData);

      setNewPostPlatform('');
      setNewPostDate('');
      setNewPostCaption('');
      setNewPostImageUrl('');
      console.log("New personal brand post added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding personal brand post: ", error);
      setAddError("Failed to add personal brand post. Please try again.");
    }
  };

  // Placeholder for Edit Post functionality
  const startEditingPost = (post) => {
      // Implement state and UI for editing posts
      alert("Edit Personal Brand Post functionality not fully implemented yet."); // Replace with actual modal/form
  };

  // Placeholder for Delete Post functionality
  const deletePost = async (id) => {
      if (window.confirm("Are you sure you want to delete this post?")) {
          const postDocRef = doc(db, 'users', userId, 'personalBrand', id);
          try {
              await deleteDoc(postDocRef);
              setPosts(posts.filter(post => post.id !== id));
              console.log(`Personal brand post ${id} deleted`);
          } catch (error) {
              console.error("Error deleting personal brand post: ", error);
              setAddError("Failed to delete personal brand post.");
          }
      }
  };


  if (loading) {
    return <DashboardCard title="Personal Brand Feed">Loading personal brand posts...</DashboardCard>;
  }

  return (
    <DashboardCard title="Personal Brand Feed">
      {/* Form to Add New Post */}
      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h4 className="font-semibold mb-3 text-[#333333]">Add New Post</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Platform (e.g., LinkedIn, Twitter)"
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={newPostPlatform}
            onChange={(e) => setNewPostPlatform(e.target.value)}
          />
          <input
            type="date"
            className="p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={newPostDate}
            onChange={(e) => setNewPostDate(e.target.value)}
          />
          <textarea
            placeholder="Caption"
            className="md:col-span-2 p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            rows="2"
            value={newPostCaption}
            onChange={(e) => setNewPostCaption(e.target.value)}
          ></textarea>
           <input
            type="text"
            placeholder="Image URL (Optional)"
            className="md:col-span-2 p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
            value={newPostImageUrl}
            onChange={(e) => setNewPostImageUrl(e.target.value)}
          />
        </div>
        {addError && <p className="text-red-500 text-sm mb-4">{addError}</p>}
        <button
          onClick={addPost}
          className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm disabled:opacity-50"
          disabled={!newPostPlatform.trim() || !newPostDate || !newPostCaption.trim()}
        >
          Add Post
        </button>
      </div>

      <h4 className="font-semibold mb-3 text-[#333333]">Upcoming Posts</h4> {/* Changed title to reflect fetched data */}
      <div className="space-y-4">
        {posts.length === 0 ? (
            <p className="text-gray-600">No posts added yet.</p>
        ) : (
            posts.map(post => (
              <div key={post.id} className="flex items-start border-b pb-4 last:pb-0 last:border-b-0">
                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt="Post preview"
                        className="w-16 h-16 object-cover rounded mr-4"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/e0e0e0/333333?text=No+Image'; }} // Fallback image on error
                    />
                )}
                <div className="flex-grow">
                  <p className="font-bold text-[#333333]">{post.platform} - {post.date}</p>
                  <p className="text-sm text-gray-600">{post.caption}</p>
                  {/* AI Tip would appear here - Placeholder */}
                   {/* {post.aiTip && <p className="text-xs text-purple-700 mt-1">AI Tip: {post.aiTip}</p>} */}
                </div>
                 <div className="flex items-center ml-4"> {/* Action buttons */}
                    <button
                        onClick={() => startEditingPost(post)}
                        className="text-blue-500 hover:text-blue-700 text-sm p-1 rounded-md hover:bg-gray-100 mr-1"
                        title="Edit Post"
                    >
                         {/* Edit Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-500 hover:text-red-700 text-sm p-1 rounded-md hover:bg-gray-100"
                        title="Delete Post"
                    >
                         {/* Delete Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </div>
              </div>
            ))
        )}
      </div>
    </DashboardCard>
  );
};

// Placeholder for Resource Library
const ResourceLibrary = ({ userId }) => {
  // This would fetch resources from Firestore based on current milestone tags
  // For now, using static data as placeholder
  const resources = [
    { id: 1, title: 'Lean Startup Summary (PDF)', tags: ['MVP', 'Validation'] },
    { id: 2, title: 'Tailwind CSS Cheatsheet (Link)', tags: ['Coding', 'Design'] },
    { id: 3, title: 'Negotiation Skills Course (Link)', tags: ['Business'] },
  ];

  // Example filtering based on a simulated current milestone tag
  const currentMilestoneTag = 'MVP';
  const filteredResources = resources.filter(res => res.tags.includes(currentMilestoneTag));


  return (
    <DashboardCard title="Resource Library">
       <p className="text-sm text-gray-600 mb-4">Filtered by current milestone: <span className="font-semibold">{currentMilestoneTag}</span></p>
      <div className="space-y-3">
        {filteredResources.map(res => (
          <div key={res.id} className="text-[#005F99] hover:underline cursor-pointer">
            {res.title}
          </div>
        ))}
      </div>
      {/* Functionality to add/manage resources in Firestore would go here */}
    </DashboardCard>
  );
};

// Accountability Pod - Frontend with Backend Interaction Simulation
const AccountabilityPod = ({ userId }) => {
  const [podMembers, setPodMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [addError, setAddError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false); // State for invite loading

  // Fetch pod members from Firestore on component mount
  useEffect(() => {
    const fetchPodMembers = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // In a real app, you would likely have a 'pods' collection,
        // and users would belong to a specific pod. For this example,
        // we'll assume 'accountabilityPod' stores members directly under the user.
        // A more robust solution would involve a separate 'pods' collection
        // and a way to manage pod memberships across users.
        const podMembersCollectionRef = collection(db, 'users', userId, 'accountabilityPod');
        const podMembersSnapshot = await getDocs(podMembersCollectionRef);
        const membersData = podMembersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Placeholder progress data - replace with actual fetched data
          habitCompletion: `${Math.floor(Math.random() * 100)}%`,
          actionCompletion: `${Math.floor(Math.random() * 100)}%`,
        }));
        setPodMembers(membersData);
        setAddError(null);
      } catch (error) {
        console.error("Error fetching pod members: ", error);
        setAddError("Failed to load accountability pod members.");
      } finally {
        setLoading(false);
      }
    };

    fetchPodMembers();
  }, [userId]); // Refetch if userId changes

  // Function to simulate calling a backend endpoint for inviting a member
  const inviteMember = async () => {
      if (!userId || !inviteEmail.trim()) {
          setAddError("Please enter an email address to invite.");
          return;
      }

      setAddError(null);
      setInviteLoading(true); // Start invite loading

      // --- Simulate Backend API Call for Invitation ---
      // In a real application, you would make an HTTP request here to your backend endpoint.
      // Example using fetch API (this is NOT a real endpoint):
      /*
      try {
          const response = await fetch('/api/invitePodMember', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // Include authentication token if needed
              },
              body: JSON.stringify({ invitedEmail: inviteEmail.trim(), invitingUserId: userId }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to send invitation');
          }

          const result = await response.json();
          console.log('Invitation API response:', result);
          alert(`Invitation sent to ${inviteEmail.trim()}!`); // Use a modal
          setInviteEmail(''); // Clear input on success

      } catch (error) {
          console.error("Error sending invitation:", error);
          setAddError(`Failed to send invitation: ${error.message}`);
      } finally {
          setInviteLoading(false); // Stop invite loading
      }
      */

      // --- Placeholder Simulation (Remove in real implementation) ---
      console.log(`Simulating invitation sent to: ${inviteEmail.trim()}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      alert(`Invitation sent to ${inviteEmail.trim()} (simulated). Full implementation requires backend.`); // Use a modal
      setInviteEmail(''); // Clear input on success
      setInviteLoading(false); // Stop invite loading
      // --- End Placeholder Simulation ---
  };

  // Function to simulate calling a backend endpoint for sending a nudge
  const sendNudge = async (memberId) => {
      // --- Simulate Backend API Call for Nudging ---
      // In a real application, you would make an HTTP request here to your backend endpoint.
      // Example using fetch API (this is NOT a real endpoint):
      /*
      try {
          const response = await fetch('/api/sendNudge', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // Include authentication token if needed
              },
              body: JSON.stringify({ nudgedUserId: memberId, nudgingUserId: userId }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to send nudge');
          }

          const result = await response.json();
          console.log('Nudge API response:', result);
          alert(`Nudge sent to member ${memberId}!`); // Use a modal

      } catch (error) {
          console.error("Error sending nudge:", error);
          alert(`Failed to send nudge: ${error.message}`);
      }
      */

      // --- Placeholder Simulation (Remove in real implementation) ---
      console.log(`Simulating nudge sent to member ID: ${memberId}`);
      alert(`Nudge sent to member ${memberId} (simulated). Full implementation requires backend.`); // Use a modal
      // --- End Placeholder Simulation ---
  };


  if (loading) {
    return <DashboardCard title="Accountability Pod">Loading accountability pod...</DashboardCard>;
  }

  return (
    <DashboardCard title="Accountability Pod">
        {/* Form to Invite New Member */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="font-semibold mb-3 text-[#333333]">Invite Member</h4>
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="email"
                    placeholder="Enter member email"
                    className="flex-grow p-2 border-b border-gray-300 focus:outline-none focus:border-[#005F99] text-sm rounded-md"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={inviteLoading} // Disable input while inviting
                />
                <button
                    onClick={inviteMember}
                    className="bg-[#005F99] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm disabled:opacity-50"
                    disabled={!inviteEmail.trim() || inviteLoading} // Disable if input is empty or loading
                >
                    {inviteLoading ? 'Inviting...' : 'Invite'}
                </button>
            </div>
             {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        </div>


      <h4 className="font-semibold mb-3 text-[#333333]">Pod Members</h4>
      <div className="space-y-4">
        {podMembers.length === 0 ? (
            <p className="text-gray-600">No pod members yet. Invite someone to join!</p>
        ) : (
            podMembers.map(member => (
              <div key={member.id} className="flex justify-between items-center border-b pb-3 last:pb-0 last:border-b-0">
                <div>
                  <p className="font-bold text-[#333333]">{member.name}</p>
                  {/* Display placeholder progress data */}
                  <p className="text-sm text-gray-600">Habits: {member.habitCompletion} | Actions: {member.actionCompletion}</p>
                </div>
                <button
                    onClick={() => sendNudge(member.id)}
                    className="bg-[#005F99] text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Nudge
                </button>
              </div>
            ))
        )}
      </div>
    </DashboardCard>
  );
};

// Placeholder for Progress Summary PDF
const ProgressSummaryPDF = ({ userId }) => {
  // This would trigger PDF generation, likely using backend/Firebase Functions to fetch data from Firestore
  const generatePDF = () => {
    alert('Generating PDF summary... (Backend/Firebase Functions functionality needed)'); // Use a modal in a real app
  };

  return (
    <DashboardCard title="Progress Summary">
      <p className="text-sm text-gray-600 mb-4">Generate your quarterly progress report.</p>
      <button
        onClick={generatePDF}
        className="bg-[#005F99] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
      >
        Generate PDF
      </button>
    </DashboardCard>
  );
};


// Main App Component
const App = () => {
  const [user, setUser] = useState(null); // Firebase Auth user object
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [goalsSet, setGoalsSet] = useState(false); // State to check if goals are set

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
          // Check if goals are set for this user
          checkGoalsSet(currentUser.uid);
      } else {
          setGoalsSet(false); // Reset if user logs out
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Check if user has set goals in Firestore
  const checkGoalsSet = async (userId) => {
      try {
          const goalDocRef = doc(db, 'users', userId, 'goals', 'myGoal');
          const goalDocSnap = await getDoc(goalDocRef);
          setGoalsSet(goalDocSnap.exists());
      } catch (error) {
          console.error("Error checking if goals are set: ", error);
          setGoalsSet(false); // Assume not set on error
      }
  };


  const handleLogout = async () => {
      try {
          await signOut(auth);
          setGoalsSet(false); // Reset state on logout
      } catch (error) {
          console.error("Error logging out: ", error);
          alert("Failed to log out."); // Use a modal
      }
  };

  if (loadingAuth) {
    return <div className="p-8 text-center">Loading authentication...</div>;
  }

  // If user is logged in but goals are not set, show the Goals Wizard
  if (user && !goalsSet) {
      return <GoalsWizard userId={user.uid} onGoalsSet={() => setGoalsSet(true)} />;
  }

  // If user is not logged in, show the Auth component
  if (!user) {
      return <Auth onLoginSuccess={() => checkGoalsSet(auth.currentUser.uid)} />;
  }


  // Main Dashboard View (User is logged in and goals are set)
  return (
    <div className="font-sans bg-[#F7F6F3] text-[#333333] min-h-screen">
      {/* Header/KPIs would go here */}
      <header className="bg-white shadow-sm p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#005F99]">Your Millionaire Mentor Dashboard</h1>
        {/* Add KPIs like Net Worth, Profit, etc. here, fetching data from Firestore */}
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
            Logout
        </button>
      </header>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar for Roadmap (visible on Tablet/Desktop) */}
        <aside className="lg:col-span-1 hidden lg:block">
          <MilestoneRoadmap userId={user.uid} />
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top row of cards */}
            <WeeklyActionCards userId={user.uid} />
            <DailyHabitTracker userId={user.uid} />
            <IncomeExpenseFeed userId={user.uid} />
            <SkillHoursLog userId={user.uid} />

            {/* Second row of cards */}
            <MVPTestLauncher userId={user.uid} />
            <PersonalBrandFeed userId={user.uid} />
            <ResourceLibrary userId={user.uid} />
            <AccountabilityPod userId={user.uid} />
            <ProgressSummaryPDF userId={user.uid} />
          </div>
        </main>
      </div>

      {/* Footer would go here */}
      <footer className="mt-12 p-4 text-center text-gray-600 text-sm">
        © 2025 Your Millionaire Mentor Dashboard
      </footer>
    </div>
  );
};

export default App;
