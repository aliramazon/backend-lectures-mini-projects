const http = require("http");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const port = 3000;
const host = "localhost";

// Utility function to read the JSON file
const readJSONFile = (callback) => {
    fs.readFile("job-applications.json", "utf8", (err, data) => {
        if (err) {
            callback(null, err);
        } else {
            callback(JSON.parse(data), null);
        }
    });
};

// Utility function to write to the JSON file
const writeJSONFile = (data, callback) => {
    fs.writeFile(
        "job-applications.json",
        JSON.stringify(data, null, 2),
        "utf8",
        callback
    );
};

// Utility function to parse the application ID from the URL
const parseId = (url) => {
    const parts = url.split("/");
    return parts[2];
};

// Utility function to verify path
const verifyPathMatch = (path) => {
    const parts = path.split("/");
    return parts.length === 3 && parts[1] === "applications";
};

// Implement CRUD functions
const getAllApplications = (res) => {
    readJSONFile((data, err) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data.applications));
    });
};

const createApplication = (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", () => {
        const newApplication = JSON.parse(body);
        const id = uuidv4();

        readJSONFile((data, err) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
            }
            data.applications[id] = newApplication;
            writeJSONFile(data, (err) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                    return;
                }
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ id, ...newApplication }));
            });
        });
    });
};

const getApplication = (req, res, id) => {
    readJSONFile((data, err) => {
        if (err || !data.applications[id]) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
            return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data.applications[id]));
    });
};

const updateApplicationStatus = (req, res, id) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", () => {
        const updatedFields = JSON.parse(body);

        readJSONFile((data, err) => {
            if (err || !data.applications[id]) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
                return;
            }
            Object.assign(data.applications[id], updatedFields);
            writeJSONFile(data, (err) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(data.applications[id]));
            });
        });
    });
};

const deleteApplication = (req, res, id) => {
    readJSONFile((data, err) => {
        if (err || !data.applications[id]) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
            return;
        }
        delete data.applications[id];
        writeJSONFile(data, (err) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
            }
            res.writeHead(204);
            res.end();
        });
    });
};

// Create the HTTP Server
const server = http.createServer((req, res) => {
    const isPathMatch = verifyPathMatch(req.url);
    const id = parseId(req.url);

    if (req.url === "/applications" && req.method === "GET") {
        getAllApplications(res);
    } else if (req.url === "/applications" && req.method === "POST") {
        createApplication(req, res);
    } else if (isPathMatch && req.method === "GET") {
        getApplication(req, res, id);
    } else if (isPathMatch && req.method === "PATCH") {
        updateApplicationStatus(req, res, id);
    } else if (isPathMatch && req.method === "DELETE") {
        deleteApplication(req, res, id);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Invalid Request");
    }
});

// Start the server
server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}/`);
});
