// Import the built-in file system module (fs) to work with files
import fs from 'fs';

// Import the readline-sync module for user input
import readlineSync from 'readline-sync';


// Define the name of the file that will store the notes
const NOTES_FILE = 'notes.json';

// Step 1: Initialize the `parsedNotes` variable
let parsedNotes = []; // Start with an empty array for notes if there's no file to load

// Step 2: Check if the file exists
if (fs.existsSync(NOTES_FILE)) {
    // The `fs.existsSync` method checks if the `NOTES_FILE` exists on the file system.
    // If it exists, the code inside this block will run.

    // Step 3: Read the file content
    const fileContent = fs.readFileSync(NOTES_FILE, 'utf-8');
    // `fs.readFileSync` reads the file's content in a synchronous (blocking) way.
    // The `utf-8` argument ensures the file is read as a text string.
    // The content of the file is stored as a string in the `fileContent` variable.

    // Step 4: Parse the file content into JavaScript objects
    parsedNotes = JSON.parse(fileContent);
    // The `JSON.parse` method converts the JSON string (`fileContent`) into a JavaScript object or array.
    // In this case, it will convert the string into an array of notes, which is assigned to `parsedNotes`.

} else {
    // If the file does not exist, the `fs.existsSync` condition is false, and this block will run.

    parsedNotes = []; // Initialize `parsedNotes` as an empty array because there's no file to load.
}

// Now, the `parsedNotes` array contains either the data from the file or an empty array if the file doesn't exist.


function displayMenu() {
    console.log(`
1. Add a note
2. List all notes
3. Read a note
4. Update a note
5. Delete a note
6. Exit
`);
}


// Helper function to save notes
function saveNote() {
    try {
        // Step 1: Convert the notes array into a JSON-formatted string
        const updatedJsonString = JSON.stringify(parsedNotes, null, 2);
        // `JSON.stringify` converts the `parsedNotes` array into a JSON-formatted string.
        // The `null` argument is for replacer (not needed here), and `2` adds indentation for readability.

        // Step 2: Save the JSON string to the "notes.json" file
        fs.writeFileSync(NOTES_FILE, updatedJsonString);
        // The `fs.writeFileSync` method writes the string to the file specified by `NOTES_FILE`.
        // If the file doesn't exist, it will be created. If it does exist, it will be overwritten.

        // Step 3: Display a success message
        console.log('Notes saved successfully!');
        // Inform the user that the notes have been saved.

    } catch (err) {
        // Step 4: Handle any errors
        console.error('Error saving notes:', err.message);
        // If an error occurs (e.g., no write permissions, disk issues), catch it and display an error message.
    }
}



function addNote() {
    // Step 1: Prompt the user for the note title
    const title = readlineSync.question("Enter note title: ");
    // The `readlineSync.question` method displays the provided string as a prompt and waits for user input.
    // The user enters the note title, and it is stored in the `title` variable.

    // Step 2: Prompt the user for the note body
    const body = readlineSync.question("Enter note body: ");
    // Similar to the previous step, the user enters the content of the note, which is stored in the `body` variable.

    // Step 3: Create a new note object
    const note = {
        title: title, // Set the title property to the user-provided title
        body: body, // Set the body property to the user-provided body
        time_added: new Date().toISOString(), // Add a timestamp indicating when the note was created
    };
    // The `new Date().toISOString()` method generates a standardized timestamp in ISO 8601 format.
    // This is useful for tracking when the note was created.

    // Step 4: Add the new note to the notes array
    parsedNotes.push(note);
    // The new `note` object is added to the `parsedNotes` array, which contains all the loaded or newly created notes.

    // Step 5: Save the updated notes to the file
    saveNote();
    // The `saveNote` function (defined elsewhere) writes the `parsedNotes` array back to the `notes.json` file.
    // This ensures that the new note is persisted to storage.

    // Step 6: Confirm success to the user
    console.log('Note added successfully!');
    // Display a success message to inform the user that the note has been added and saved.
}


function listNotes() {
    // Step 1: Check if there are any notes
    if (parsedNotes.length === 0) {
        console.log('No notes found.');
        return; // Exit the function if there are no notes
    }

    // Step 2: Print the header for the notes
    console.log('\nYour Notes:\n');

    // Step 3: Iterate through the notes and display them
    parsedNotes.forEach((note, index) => {
        const prefix = `${index + 1}. `; // Number each note
        const padding = " ".repeat(prefix.length); // Create padding for alignment

        console.log(`${prefix}Title: ${note.title}`); 
        console.log(`${padding}Body: ${note.body}`); 
        console.log(`${padding}Added on: ${note.time_added}\n`); 
    });
}


function viewNote() {
    const searchWord = readlineSync.question("Enter note title: ");

    // Filter notes while retaining original indices
    const notesResult = parsedNotes
        .map((note, index) => ({ ...note, originalIndex: index }))
        .filter(note => note.title.toLowerCase().includes(searchWord.toLowerCase()));

    if (notesResult.length === 0) {
        console.log(`\nNo notes found with the title containing "${searchWord}".`);
        return;
    }

    console.log('\nMatching Notes:\n');

    // Display matching notes with indices
    notesResult.forEach((note, index) => {
        const prefix = `${index + 1}. `;
        const padding = " ".repeat(prefix.length);

        console.log(`${prefix}Title: ${note.title}`);
        console.log(`${padding}Body: ${note.body}`);
        console.log(`${padding}Added on: ${note.time_added}\n`);
    });

    return notesResult; // Return the filtered notes with original indices
}


function updateNote() {
    const notesResult = viewNote(); // Get filtered notes with original indices
    if (!notesResult) return;

    const numToUpdate = readlineSync.question("Enter the number of the note to update: ");

    const selectedIndex = parseInt(numToUpdate, 10) - 1;

    // Validate input
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= notesResult.length) {
        console.log("Invalid note number. Please try again.");
        return;
    }

    const originalIndex = notesResult[selectedIndex].originalIndex;

    // Update the original note
    const noteToUpdate = parsedNotes[originalIndex];
    console.log(`\nYou are updating the note titled: "${noteToUpdate.title}"\n`);

    const newTitle = readlineSync.question("Enter the new title (or press Enter to keep the current title): ");
    const newBody = readlineSync.question("Enter the new body (or press Enter to keep the current body): ");

    noteToUpdate.title = newTitle.trim() !== "" ? newTitle : noteToUpdate.title;
    noteToUpdate.body = newBody.trim() !== "" ? newBody : noteToUpdate.body;

    saveNote();
    console.log("\nNote updated successfully!\n");
}


function deleteNote() {
    const notesResult = viewNote(); // Get filtered notes with original indices
    if (!notesResult) return;

    const numToDelete = readlineSync.question("Enter the number of the note to delete: ");

    const selectedIndex = parseInt(numToDelete, 10) - 1;

    // Validate input
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= notesResult.length) {
        console.log("Invalid note number. Please try again.");
        return;
    }

    const originalIndex = notesResult[selectedIndex].originalIndex;

    // Get the note to be deleted (for feedback)
    const deletedNote = parsedNotes[originalIndex];

    // Delete the note from the original array
    parsedNotes.splice(originalIndex, 1);

    // Save the updated notes
    saveNote();

    console.log(`\nNote titled "${deletedNote.title}" deleted successfully!\n`);
}


function main() {
    while (true) { // Keep displaying the menu until the user exits
        displayMenu();

        const choice = readlineSync.question("Enter your choice: ");

        switch (choice) {
            case "1":
                addNote();
                break;
            case "2":
                listNotes();
                break;
            case "3":
                viewNote();
                break;
            case "4":
                updateNote();
                break;
            case "5":
                deleteNote();
                break;
            case "6":
                console.log('Goodbye!');
                process.exit(0);
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

// Start the program
main();
