const fs = require("fs");
const glob = require("glob");

const eventPatterns = ["RegisterNetEvent", "AddEventHandler"];
const triggerPatterns = [
    "TriggerEvent",
    "TriggerServerEvent",
    "TriggerClientEvent",
];

function findMatches(patterns, content) {
    const matches = [];
    patterns.forEach((pattern) => {
        const regex = new RegExp(`${pattern}\\(['"](.+?)['"]`, "g");
        let match;
        while ((match = regex.exec(content)) !== null) {
            matches.push(match[1]);
        }
    });
    return matches;
}

function findUnusedEvents(files) {
    const registeredEvents = new Set();
    const triggeredEvents = new Set();

    files.forEach((file) => {
        const content = fs.readFileSync(file, "utf8");
        findMatches(eventPatterns, content).forEach((event) =>
            registeredEvents.add(event)
        );
        findMatches(triggerPatterns, content).forEach((event) =>
            triggeredEvents.add(event)
        );
    });

    return Array.from(registeredEvents).filter(
        (event) => !triggeredEvents.has(event)
    );
}

function saveResultsToFile(results) {
    const outputFile = "unused_events.txt";
    fs.writeFileSync(outputFile, results.join("\n"), "utf8");
}

const folderPath = process.argv[2] || ".";

try {
    const files = glob.sync(`${folderPath}/**/*.lua`);

    const unusedEvents = findUnusedEvents(files);
    if (unusedEvents.length > 0) {
        saveResultsToFile(unusedEvents);
    } else {
        console.log("No unused events found.");
        fs.writeFileSync("unused_events.txt", "", "utf8");
    }
} catch (err) {
    console.error("Error finding Lua files:", err);
}
