// Function to fetch responses from the JSON file (expects an array of objects)
async function loadResponses() {
    try {
        const response = await fetch('responses.json');  // Fetch the JSON file
        const data = await response.json();  // Parse JSON
        return data; // Now data is an array of response objects
    } catch (error) {
        console.error("Error loading responses:", error);
        return [];
    }
}

// Function to check for partial matches in the user input using synonyms
async function checkForPartialMatch(userInput) {
    const responses = await loadResponses();  // Load responses from the JSON file
    const normalizedInput = userInput.toLowerCase();  // Normalize user input for case-insensitive matching

    for (let entry of responses) {
        let foundMatch = false;

        // Check each synonym with regex for better matching
        for (let synonym of entry.synonyms) {
            let regex = new RegExp(`\\b${synonym}\\b`, 'i');  // Word boundary and case-insensitive match
            if (regex.test(normalizedInput)) {
                foundMatch = true;
                break;
            }
        }

        if (foundMatch) {
            // Randomize the answer selection if there are multiple answers
            if (Array.isArray(entry.answer)) {
                const randomIndex = Math.floor(Math.random() * entry.answer.length);
                return entry.answer[randomIndex];  // Return a random answer
            } else {
                return entry.answer;  // Return the single answer
            }
        }
    }
    return null;  // If no match is found
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim().toLowerCase();
    const chatBox = document.getElementById("chat-box");

    if (userInput !== "") {
        // Display the user's message
        const userMessage = document.createElement("div");
        userMessage.classList.add("user-message");
        userMessage.textContent = `${userInput}`;
        chatBox.appendChild(userMessage);

        // Add a typing animation for the bot
        const botTyping = document.createElement("div");
        botTyping.classList.add("bot-typing");
        botTyping.textContent = "typing...";
        chatBox.appendChild(botTyping);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Simulate a delay before showing the bot's response
        setTimeout(async () => {
            // Remove the typing animation
            chatBox.removeChild(botTyping);

            const response = await checkForPartialMatch(userInput);

            const botResponse = document.createElement("div");
            botResponse.classList.add("bot-response");

            if (response) {
                botResponse.textContent = `ChatNova : ${response}`;
            } else if (isMathExpression(userInput)) {
                const result = solveMathExpression(userInput);
                botResponse.textContent = `ChatNova : The answer is ${result}`;
            } else {
                botResponse.textContent = `ChatNova : কি কস মাদারচোদ,কিছু বুযি না।অঙ্ক জিগা,`;
            }

            chatBox.appendChild(botResponse);
            document.getElementById("user-input").value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            saveChatHistory(userInput, botResponse.textContent);  // Save the conversation to localStorage
        }, 700);  // Delay (700ms) to simulate typing
    }
}

function isMathExpression(input) {
    return /^[0-9+\-*/().\s]*$/.test(input);  // Simple regex to check for math expressions
}

function solveMathExpression(input) {
    try {
        return eval(input);  // Evaluate the math expression safely
    } catch (e) {
        return "Invalid math expression.";
    }
}

// Function to save chat history to localStorage
function saveChatHistory(userMessage, botMessage) {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.push({ user: userMessage, bot: botMessage });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Function to load chat history from localStorage
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const chatBox = document.getElementById("chat-box");

    chatHistory.forEach(entry => {
        const userMessage = document.createElement("div");
        userMessage.classList.add("user-message");
        userMessage.textContent = `${entry.user}`;
        chatBox.appendChild(userMessage);

        const botResponse = document.createElement("div");
        botResponse.classList.add("bot-response");
        botResponse.textContent = `ChatNova : ${entry.bot}`;
        chatBox.appendChild(botResponse);
    });

    chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to the bottom
}

// Load chat history when the page is loaded
window.onload = loadChatHistory;
