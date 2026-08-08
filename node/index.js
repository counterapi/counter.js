// Simple CounterAPI Hello World
// Import the Counter class from the library
import { Counter } from '../../dist/counter.esm.js';

// Create a Counter client
const counter = new Counter({
  workspace: 'test'
});

// Get the counter named 'test'
async function getCounter() {
  try {
    const result = await counter.get('test');
    console.log('Counter value:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
getCounter(); 