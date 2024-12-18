import express from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();


admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount)
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped \n with actual newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

const app = express();
app.use(express.json());

app.get('',(req,res)=>{res.send('Hello World in Node js Server!!!')})

app.post('/todos', async (req, res) => {
  try {
    const { title, detail, date, time } = req.body;
    const todoRef = db.collection('todos').doc(); 
    await todoRef.set({
      id: todoRef.id, 
      title,
      detail,
      date,
      time,
      completed: false 
    });
    res.status(201).json({ message: 'To-do list item created successfully', id: todoRef.id });
  } catch (error) {
    console.error('Error creating to-do list item:', error);
    res.status(500).json({ error: 'Failed to create to-do list item' });
  }
});

// Get all to-do list items
app.get('/todos', async (req, res) => {
  try {
    const todos = [];
    const querySnapshot = await db.collection('todos').get();
    querySnapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    res.json(todos);
  } catch (error) {
    console.error('Error fetching to-do list items:', error);
    res.status(500).json({ error: 'Failed to fetch to-do list items' });
  }
});

// Mark a to-do list item as complete
app.put('/todos/:id/complete', async (req, res) => {
  try {
    const todoId = req.params.id;
    const todoRef = db.collection('todos').doc(todoId);
    await todoRef.update({ completed: true });
    res.json({ message: 'To-do list item marked as complete' });
  } catch (error) {
    console.error('Error marking to-do list item as complete:', error);
    res.status(500).json({ error: 'Failed to mark to-do list item as complete' });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const { title, detail, date, time } = req.body;
    const todoRef = db.collection('todos').doc(todoId);
    const doc = await todoRef.get();
    if (!doc.exists || doc.data().completed) {
      return res.status(400).json({ error: 'To-do list item not found or already completed' });
    }
    await todoRef.update({ title, detail, date, time });
    res.json({ message: 'To-do list item updated successfully' });
  } catch (error) {
    console.error('Error updating to-do list item:', error);
    res.status(500).json({ error: 'Failed to update to-do list item' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port https://localhost:${port}`);
});