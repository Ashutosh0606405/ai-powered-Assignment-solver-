/**
 * Gemini API Integration for ScribeAI
 * Supports actual API communication (via direct REST endpoints)
 * and falls back to an interactive mock solver if no API key is provided.
 */

// Helper to convert File object to Base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract only the raw base64 string from data URL
      const base64String = reader.result.split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Solves an assignment using Gemini or fallbacks.
 * @param {Object} fileInfo - { base64, mimeType, name } or null
 * @param {string} textPrompt - text typed by the student
 * @param {string} apiKey - Gemini API Key (optional)
 * @returns {Promise<string>} - Solved assignment text (plain text optimized for handwriting fonts)
 */
export const solveAssignment = async (fileInfo, textPrompt, apiKey) => {
  // If no API Key is provided, use the high-fidelity mock solver
  if (!apiKey || apiKey.trim() === '') {
    return simulateMockSolver(fileInfo, textPrompt);
  }

  try {
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts = [];

    // Add prompt instruction
    const systemInstruction = `
      You are an expert tutor solving an assignment for a student. 
      Your task is to solve the assignment provided in the text or attached file.

      CRITICAL FORMATTING RULES:
      1. DO NOT use markdown symbols (no asterisks, no hashes, no code blocks, no **bold**, no *italics*). The output will be rendered in a handwriting font on a lined notebook page, so markdown syntax looks completely unnatural and broken.
      2. Use simple plain text. For emphasis, write in uppercase or use underlining/arrows (e.g. "--> ANSWER:").
      3. For headers, use standard text on its own line (e.g., "Assignment: Chemistry Homework", "Question 1 Solution").
      4. Solve the questions step-by-step, explaining the reasoning clearly in a warm, student-friendly, human-like hand-written style.
      5. Keep equations simple and linear (e.g., "x^2 + 2x + 1 = 0" rather than complex LaTeX math blocks). Use standard symbols (+, -, *, /, =).
      6. Break long paragraphs into natural, shorter blocks to mimic hand-written pages.
      7. If the assignment involves a graph or network diagram (e.g., node connections, spanning trees, weights), you can render a beautiful hand-drawn diagram in the page by outputting a custom graph tag on its own line:
         [graph: Node1-Node2:Weight, Node2-Node3:Weight, ...]
         For example: [graph: A-B:4, B-C:10, C-A:3, B-D:4, D-C:2, C-E:6, D-E:1]
         Only use node names that are simple letters (A, B, C, D, E etc.) or short words, and keep weights numeric.
    `;

    parts.push({ text: systemInstruction });

    // Add user text
    let userText = `Assignment prompt/instructions:\n${textPrompt || "Please solve the attached assignment."}`;
    parts.push({ text: userText });

    // Add file if present
    if (fileInfo && fileInfo.base64) {
      parts.push({
        inlineData: {
          mimeType: fileInfo.mimeType,
          data: fileInfo.base64
        }
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const solutionText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!solutionText) {
      throw new Error("No solution received from Gemini. Please check your prompt or file.");
    }

    return cleanMarkdown(solutionText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// Strip standard markdown elements that the AI might still generate
const cleanMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italics
    .replace(/###?\s+(.*)/g, '$1')    // Headers
    .replace(/`([^`]+)`/g, '$1')      // Code snippets
    .replace(/__([^_]+)__/g, '$1');   // Alternative bold
};

// Simulate a beautiful educational response based on input prompts
const simulateMockSolver = (fileInfo, textPrompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const query = (textPrompt || '').toLowerCase();
      let response = '';

      if (fileInfo) {
        response += `ASSIGNMENT ANALYSIS
File Uploaded: ${fileInfo.name} (${fileInfo.mimeType})
File Status: Successfully Scanned & Transformed.

`;
      }

      if (query.includes('graph') || query.includes('prim') || query.includes('spanning') || query.includes('tree') || query.includes('mst')) {
        response += `Minimum Spanning Tree Solver

Question: Consider the following Graph G and obtain the Minimum Spanning Tree (MST) using Prim's Algorithm.

[graph: A-B:4, B-C:10, C-A:3, B-D:4, D-C:2, C-E:6, D-E:1]

Step-by-Step Solution:
1. Start from vertex A.
   - Edges connected to A: A-B (weight 4) and A-C (weight 3).
   - Choose the minimum weight edge: A-C (weight 3).
   - Vertices in tree: {A, C}.

2. Next, look at all edges connecting {A, C} to external nodes:
   - Edges: A-B (4), C-B (10), C-D (2), C-E (6).
   - Choose the minimum weight edge: C-D (weight 2).
   - Vertices in tree: {A, C, D}.

3. Next, look at all edges connecting {A, C, D} to external nodes:
   - Edges: A-B (4), D-E (1), C-E (6).
   - Choose the minimum weight edge: D-E (weight 1).
   - Vertices in tree: {A, C, D, E}.

4. Next, look at all edges connecting {A, C, D, E} to external nodes:
   - Edges: A-B (4), D-B (4).
   - Choose A-B (weight 4) to include node B.
   - Vertices in tree: {A, B, C, D, E}.

All nodes are connected.
The total cost of the Minimum Spanning Tree is:
3 + 2 + 1 + 4 = 10.

Final MST Edges:
A-C (3), C-D (2), D-E (1), A-B (4).`;
      } else if (query.includes('math') || query.includes('solve') || query.includes('x =') || query.includes('equation')) {
        response += `Algebra Assignment Solution

Question 1: Solve the quadratic equation x^2 - 5x + 6 = 0.

Step-by-Step Solution:
We need to find two numbers that multiply to 6 and add up to -5.
Let's list the factors of 6:
- 1 and 6 (adds up to 7)
- 2 and 3 (adds up to 5)
- -2 and -3 (adds up to -5) -> This is our pair!

We factor the quadratic expression as:
(x - 2)(x - 3) = 0

To solve for x, we set each factor equal to zero:
x - 2 = 0  =>  x = 2
x - 3 = 0  =>  x = 3

Therefore, the solutions are x = 2 and x = 3.

--------------------------------------------------

Question 2: If a line passes through (1, 3) and (3, 7), find its equation in slope-intercept form (y = mx + c).

Step-by-Step Solution:
1. Find the slope (m) using the formula m = (y2 - y1) / (x2 - x1):
   m = (7 - 3) / (3 - 1)
   m = 4 / 2
   m = 2

2. Use the point-slope formula with (1, 3) to find the intercept:
   y - y1 = m(x - x1)
   y - 3 = 2(x - 1)
   y - 3 = 2x - 2
   y = 2x + 1

So, the equation of the line is:
y = 2x + 1

Done! Let me know if you need another problem solved.`;
      } else if (query.includes('history') || query.includes('war') || query.includes('revolution') || query.includes('write')) {
        response += `History Essay Assignment

Topic: Causes of the French Revolution (1789)

The French Revolution was a turning point in modern European history. Here are the primary reasons solved and outlined:

1. Social Inequality (The Three Estates System):
French society was divided into three unequal classes: the First Estate (Clergy), the Second Estate (Nobility), and the Third Estate (Commoners/Peasants). The Third Estate made up 98% of the population but shouldered almost the entire tax burden, while the clergy and nobles paid virtually nothing.

2. Economic Crisis & Debt:
Due to participation in expensive wars (including the American Revolutionary War) and the lavish spending of King Louis XVI and Queen Marie Antoinette, France went virtually bankrupt. A terrible harvest in 1788 also caused widespread famine and skyrocketed the price of bread.

3. The Enlightenment Ideas:
Philosophers like Voltaire, Rousseau, and Montesquieu introduced concepts of liberty, equality, and constitutional government. These ideas inspired the Third Estate to question traditional absolute monarchies.

Conclusion:
Combined, the heavy taxes, starvation, and new ideals pushed the people of Paris to storm the Bastille on July 14, 1789, starting the revolution.

Hope this helps with your essay structure!`;
      } else {
        // General helpful response
        response += `Assignment Solved: General Questions

Original prompt/assignment request:
"${textPrompt || 'Scan of assignment questions'}"

Analysis & Solutions:

Here are the step-by-step explanations for your study guide:

1. Overview:
I have processed your questions and converted them into clean, human-like notes. You can customize this text using the settings on the right panel.

2. Study Guide Tips:
- Change the handwriting style using the font picker.
- Tweak letter spacing and spacing variations to make it look like organic writing.
- Select your paper style: lined paper has a classic red margin line, grid is great for math, and plain works for essays.
- You can print directly or save as a PDF to submit.

If you have a specific question you want me to solve, just type it out in the sidebar (for example, try asking a math problem or history essay topic) and click "Solve"!`;
      }

      resolve(response);
    }, 1500);
  });
};
