const express = require("express");

const fs = require("fs");

const path = require("path");

const session = require("express-session");

const app = express();

const PORT = 8080;

const pageDir = "pages";

const logDir = "logs";

// Create directories if they don't exist

fs.mkdirSync(pageDir, { recursive: true });

fs.mkdirSync(logDir, { recursive: true });

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "templates"));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);

// Dummy user credentials

const validUser = { username: "admin", password: "password" };

app.get("/", listPages);

app.post("/login", login);

app.post("/logout", logout);

app.get("/view/:name", viewPage);

app.get("/edit", editPage);

app.get("/edit/:name", editPage);

app.post("/save", savePage);

app.get("/recentchanges", recentChanges);

app.get("/pageslog", pagesLog);

function listPages(req, res) {
  fs.readdir(pageDir, (err, files) => {
    if (err) return res.status(500).send("Error listing pages");

    const pageNames = files

      .filter((file) => file.endsWith(".txt"))

      .map((file) => path.basename(file, ".txt"));

    const user = req.session.user;
    console.log(user);
    res.render("index", { user, pageNames });
  });
}

function login(req, res) {
  if (req.session.user) {
    res.redirect("/");
  }
  const { username, password } = req.body;
  if (username === validUser.username && password === validUser.password) {
    req.session.user = { username: username };
    res.redirect("/");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/");
  });
}

function viewPage(req, res) {
  const pageName = req.params.name;
  const pagePath = path.join(pageDir, `${pageName}.txt`);

  fs.readFile(pagePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("Page not found");

    const lines = data.split("\n");
    const title = lines[0] || "Untitled";
    const content = lines.slice(1).join("\n") || "";

    res.render("view", { Name: pageName, Title: title, Content: content });
  });
}

function editPage(req, res) {
  const pageName = req.params.name;
  let title = "";
  let content = "";

  if (pageName) {
    const pagePath = path.join(pageDir, `${pageName}.txt`);
    if (fs.existsSync(pagePath)) {
      const data = fs.readFileSync(pagePath, "utf8");
      const lines = data.split("\n");
      title = lines[0] || "";
      content = lines.slice(1).join("\n") || "";
    }
  }

  res.render("edit", { Name: pageName, Title: title, Content: content });
}

function savePage(req, res) {
  const title = req.body.title;
  const pageName = req.body.name ? req.body.name : title;
  const content = req.body.content;
  const data = `${title}\n${content}`.trim();
  const pagePath = path.join(pageDir, `${pageName}.txt`);

  fs.writeFile(pagePath, data, "utf8", (err) => {
    if (err) return res.status(500).send("Error saving page");
    logChange(pageName, title);
    res.redirect(`/view/${encodeURIComponent(pageName)}`);
  });
}

function logChange(pageName, title) {
  const logFilePath = path.join(logDir, `${pageName}.log`);
  const logEntry = `${new Date().toISOString()} - Title changed to: ${title}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) console.error("Error logging the change:", err);
  });
}

function recentChanges(req, res) {
  fs.readdir(pageDir, (err, files) => {
    if (err) return res.status(500).send("Error listing pages");

    const changes = files.map((file) => {
      const stat = fs.statSync(path.join(pageDir, file));
      return {
        Name: path.basename(file, ".txt"),
        Date: stat.mtime.toISOString(),
      };
    });

    res.render("RecentChanges", { changes });
  });
}

function pagesLog(req, res) {
  fs.readdir(logDir, (err, files) => {
    if (err) return res.status(500).send("Error listing logs");

    const logs = files.map((file) => {
      const name = path.basename(file, ".log");

      const data = fs

        .readFileSync(path.join(logDir, file), "utf8")

        .trim()

        .split("\n");

      return {
        Name: name,

        Logs: data,
      };
    });

    res.render("PagesLog", { logs });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send("Something broke!");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/"); // Handle the error appropriately
    }

    res.redirect("/login"); // Redirect to login page after logout
  });
});
