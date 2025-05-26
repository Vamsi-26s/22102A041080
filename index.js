
const express = require('express');
const axios = require('axios');

const app = express();
const port = 8000;


const WINDOW_SIZE = 10;
const REQUEST_TIMEOUT = 500; 
const TEST_SERVER_URL = 'http://test-server/api/numbers/';
const VALID_IDS = new Set(['p', 'f', 'e', 'r']);

let numbers = [];
async function fetchNumber(numberId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await axios.get(`${TEST_SERVER_URL}${numberId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const number = response.data?.number;
    if (!Number.isInteger(number)) {
      console.warn(`Invalid number format from API for ${numberId}: ${JSON.stringify(response.data)}`);
      return null;
    }
    return number;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Failed to fetch number for ${numberId}: ${error.message}`);
    return null;
  }
}


function calculateAverage(nums) {
  if (nums.length === 0) return 0.0;
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return Number((sum / nums.length).toFixed(2));
}

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;
  console.log(`Received request for: /numbers/${numberId}`); 

  if (!VALID_IDS.has(numberId)) {
    console.log(`Invalid numberId: ${numberId}`); 
    return res.status(400).json({
      error: "Invalid number ID. Use 'p', 'f', 'e', or 'r'."
    });
  }


  const newNumber = await fetchNumber(numberId);

  if (newNumber === null) {
    return res.json({
      windowPrevState: prevNumbers,
      windowCurrState: [...numbers],
      numbers: [...numbers],
      avg: calculateAverage(numbers)
    });
  }

  if (!numbers.includes(newNumber)) {
    numbers.push(newNumber);
    if (numbers.length > WINDOW_SIZE) {
      numbers.shift();
    }
  }

  const currNumbers = [...numbers];
  res.json({
    windowPrevState: prevNumbers,
    windowCurrState: currNumbers,
    numbers: currNumbers,
    avg: calculateAverage(currNumbers)
  });
});

app.listen(port, () => {
  console.log(`Average Calculator Microservice running on http://localhost:${port}`);
});

