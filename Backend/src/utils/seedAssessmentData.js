import { Question } from "../models/assessment.model.js";

export const initialQuestions = [
  // 1. React
  {
    skill: "React",
    question: "What is the primary purpose of the useEffect hook in React?",
    options: [
      "To directly mutate the DOM tree",
      "To perform side effects in functional components like data fetching and subscriptions",
      "To manage global Redux state",
      "To style React components using CSS-in-JS",
    ],
    correctAnswer: 1,
    explanation: "useEffect allows functional components to perform side effects such as data fetching, subscriptions, and DOM manipulations after render.",
    topic: "Hooks & Lifecycle",
    difficulty: "Beginner",
  },
  {
    skill: "React",
    question: "How does React's Virtual DOM improve application performance?",
    options: [
      "By compiling JSX directly into WebAssembly",
      "By calculating diffs in memory and updating only the changed parts of the real DOM",
      "By bypassing the browser rendering engine entirely",
      "By storing component states in localStorage automatically",
    ],
    correctAnswer: 1,
    explanation: "React's Virtual DOM compares current and previous states in memory (reconciliation/diffing) and batches minimal real DOM updates.",
    topic: "Virtual DOM & Reconciliation",
    difficulty: "Intermediate",
  },
  {
    skill: "React",
    question: "When should you use useMemo instead of useCallback?",
    options: [
      "When you need to memoize a computed value rather than a function definition",
      "When you are making asynchronous API requests",
      "When you want to attach an event listener to a button",
      "When you need to trigger a re-render manually",
    ],
    correctAnswer: 0,
    explanation: "useMemo caches the result of a calculation between renders, while useCallback caches a function definition between renders.",
    topic: "Performance & Optimization",
    difficulty: "Advanced",
  },
  {
    skill: "React",
    question: "Why should keys in React lists be unique among siblings and not random indices?",
    options: [
      "Keys are required by CSS selectors for styling",
      "Keys help React identify which items have changed, been added, or been removed during reconciliation",
      "Random keys make animations smoother",
      "Keys automatically sort arrays in ascending order",
    ],
    correctAnswer: 1,
    explanation: "Stable unique keys allow React to track elements across renders and avoid unnecessary re-mounts or corrupted input states.",
    topic: "Core Concepts",
    difficulty: "Beginner",
  },
  {
    skill: "React",
    question: "What does the React Context API provide?",
    options: [
      "A way to pass data through the component tree without passing props down manually at every level (prop drilling)",
      "A server-side routing mechanism for Next.js",
      "A database connection manager for MongoDB",
      "An automated unit test generator",
    ],
    correctAnswer: 0,
    explanation: "Context provides a way to share values like themes, auth user, or settings between components without prop drilling.",
    topic: "State Management",
    difficulty: "Intermediate",
  },

  // 2. JavaScript
  {
    skill: "JavaScript",
    question: "What will `console.log(typeof null)` output in JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correctAnswer: 2,
    explanation: "In JavaScript, typeof null returns 'object', which is a historical bug from the language's initial release.",
    topic: "Data Types & Coercion",
    difficulty: "Beginner",
  },
  {
    skill: "JavaScript",
    question: "What is a closure in JavaScript?",
    options: [
      "A method to close browser tabs using window.close()",
      "A function bundled together with references to its surrounding lexical environment",
      "A syntax error caused by unclosed parentheses",
      "A way to terminate a running web worker",
    ],
    correctAnswer: 1,
    explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has executed.",
    topic: "Scoping & Closures",
    difficulty: "Intermediate",
  },
  {
    skill: "JavaScript",
    question: "What is the order of execution in the JavaScript Event Loop?",
    options: [
      "Call Stack -> Microtask Queue (Promises) -> Macrotask Queue (setTimeout/I/O)",
      "Macrotask Queue -> Call Stack -> Microtask Queue",
      "Microtask Queue -> Macrotask Queue -> Call Stack",
      "Random parallel execution across all CPU cores",
    ],
    correctAnswer: 0,
    explanation: "The event loop executes code on the Call Stack first, drains the Microtask queue (Promises/MutationObserver), and then picks the next task from the Macrotask queue.",
    topic: "Asynchronous JS & Event Loop",
    difficulty: "Advanced",
  },
  {
    skill: "JavaScript",
    question: "What is the difference between `==` and `===` in JavaScript?",
    options: [
      "`==` compares both value and type, while `===` converts types first",
      "`===` performs strict equality checking without type coercion, whereas `==` performs type coercion",
      "`===` only works for numbers and strings",
      "There is no difference in ES6+",
    ],
    correctAnswer: 1,
    explanation: "`===` checks for strict equality (same value and same type) without type coercion.",
    topic: "Operators & Equality",
    difficulty: "Beginner",
  },

  // 3. Node.js
  {
    skill: "Node.js",
    question: "Which core module in Node.js is primarily used for handling file system operations?",
    options: ["http", "path", "fs", "events"],
    correctAnswer: 2,
    explanation: "The `fs` (File System) module enables interacting with the file system asynchronously and synchronously.",
    topic: "Core Modules",
    difficulty: "Beginner",
  },
  {
    skill: "Node.js",
    question: "What is the role of Libuv in Node.js architecture?",
    options: [
      "It is the CSS rendering engine",
      "It is a multi-platform C library that provides the event loop and asynchronous I/O support",
      "It manages npm package versions",
      "It is the MongoDB database connector",
    ],
    correctAnswer: 1,
    explanation: "Libuv provides Node.js with its cross-platform event loop, thread pool for non-blocking I/O, and asynchronous capabilities.",
    topic: "Architecture & Runtime",
    difficulty: "Advanced",
  },
  {
    skill: "Node.js",
    question: "Why should you avoid long-running synchronous code on the Node.js main thread?",
    options: [
      "It causes memory leaks immediately",
      "It blocks the event loop, preventing other incoming requests from being handled",
      "Node.js will crash with a segmentation fault",
      "It disables JavaScript garbage collection",
    ],
    correctAnswer: 1,
    explanation: "Node.js is single-threaded for JavaScript execution; blocking the event loop stalls all concurrent request handling.",
    topic: "Performance & Concurrency",
    difficulty: "Intermediate",
  },

  // 4. Express.js
  {
    skill: "Express.js",
    question: "What is middleware in Express.js?",
    options: [
      "A database engine for caching",
      "Functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle",
      "The client-side React router",
      "A CSS compiler for frontend assets",
    ],
    correctAnswer: 1,
    explanation: "Middleware functions execute during the lifecycle of an HTTP request to perform tasks like auth, logging, body parsing, or error handling.",
    topic: "Middleware Architecture",
    difficulty: "Beginner",
  },
  {
    skill: "Express.js",
    question: "How do you define an error-handling middleware function in Express?",
    options: [
      "By passing 4 arguments: (err, req, res, next)",
      "By calling app.handleErrors()",
      "By using a try-catch block around the entire app.listen()",
      "By setting res.statusCode = 500",
    ],
    correctAnswer: 0,
    explanation: "Express recognizes middleware with four arguments `(err, req, res, next)` as error-handling middleware.",
    topic: "Error Handling",
    difficulty: "Intermediate",
  },

  // 5. MongoDB
  {
    skill: "MongoDB",
    question: "What is a document in MongoDB?",
    options: [
      "A PDF file stored on disk",
      "A BSON (Binary JSON) data record composed of field and value pairs",
      "A relational table column definition",
      "An SQL query script",
    ],
    correctAnswer: 1,
    explanation: "MongoDB stores data records as BSON documents, which are similar to JSON objects.",
    topic: "Data Modeling",
    difficulty: "Beginner",
  },
  {
    skill: "MongoDB",
    question: "What is the purpose of an Index in MongoDB?",
    options: [
      "To enforce strict schema types on all documents",
      "To improve query search performance by preventing full collection scans",
      "To automatically back up data to the cloud",
      "To encrypt documents at rest",
    ],
    correctAnswer: 1,
    explanation: "Indexes support the efficient execution of queries in MongoDB by storing a small portion of the collection's data set in an easy-to-traverse form.",
    topic: "Indexing & Performance",
    difficulty: "Intermediate",
  },
  {
    skill: "MongoDB",
    question: "What does MongoDB's aggregation pipeline do?",
    options: [
      "It merges multiple MongoDB databases into a single cluster",
      "It processes documents through sequential stages (like $match, $group, $project) to transform and compute aggregated results",
      "It converts MongoDB BSON into SQL statements",
      "It compresses database disk storage",
    ],
    correctAnswer: 1,
    explanation: "The aggregation pipeline is a framework for data processing and analytics modeling multi-stage transformations.",
    topic: "Aggregation Framework",
    difficulty: "Advanced",
  },

  // 6. SQL
  {
    skill: "SQL",
    question: "Which SQL clause is used to filter records after an aggregate function (GROUP BY)?",
    options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
    correctAnswer: 1,
    explanation: "HAVING filters groups created by the GROUP BY clause, whereas WHERE filters individual rows before grouping.",
    topic: "Queries & Filtering",
    difficulty: "Intermediate",
  },
  {
    skill: "SQL",
    question: "What is the difference between INNER JOIN and LEFT JOIN?",
    options: [
      "INNER JOIN returns all rows from the left table; LEFT JOIN returns only matching rows",
      "INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table",
      "LEFT JOIN drops unmatched rows from the left table",
      "There is no difference in ANSI SQL",
    ],
    correctAnswer: 1,
    explanation: "INNER JOIN returns only records where keys match in both tables. LEFT JOIN preserves all records from the left table.",
    topic: "Joins & Relationships",
    difficulty: "Beginner",
  },

  // 7. Python
  {
    skill: "Python",
    question: "What is the difference between a Python list and a tuple?",
    options: [
      "Lists are immutable, while tuples are mutable",
      "Lists are mutable (can be modified), while tuples are immutable (read-only once created)",
      "Tuples can only store integers",
      "Lists cannot contain duplicate elements",
    ],
    correctAnswer: 1,
    explanation: "Lists are mutable and defined with square brackets `[]`, whereas tuples are immutable and defined with parentheses `()`.",
    topic: "Data Structures",
    difficulty: "Beginner",
  },
  {
    skill: "Python",
    question: "What does the `yield` keyword do in a Python function?",
    options: [
      "It terminates the program execution",
      "It turns the function into a generator, pausing execution and returning a value to the caller without losing state",
      "It imports an external library dynamically",
      "It defines an asynchronous coroutine",
    ],
    correctAnswer: 1,
    explanation: "`yield` produces a value from a generator function and suspends execution until the next value is requested.",
    topic: "Generators & Iterators",
    difficulty: "Intermediate",
  },

  // 8. Java
  {
    skill: "Java",
    question: "What are the 4 fundamental principles of Object-Oriented Programming (OOP) in Java?",
    options: [
      "Compilation, Interpretation, Garbage Collection, Threading",
      "Encapsulation, Inheritance, Polymorphism, Abstraction",
      "Public, Private, Protected, Default",
      "Classes, Objects, Methods, Variables",
    ],
    correctAnswer: 1,
    explanation: "Encapsulation, Inheritance, Polymorphism, and Abstraction are the four core pillars of OOP.",
    topic: "Object-Oriented Programming",
    difficulty: "Beginner",
  },
  {
    skill: "Java",
    question: "What is the purpose of the Java Virtual Machine (JVM) Garbage Collector?",
    options: [
      "To optimize database queries automatically",
      "To automatically reclaim memory occupied by objects that are no longer reachable or referenced",
      "To compile Java bytecode into C++ code",
      "To format source code indentation",
    ],
    correctAnswer: 1,
    explanation: "Garbage collection in Java provides automatic memory management by identifying and freeing unreferenced heap memory.",
    topic: "Memory Management & JVM",
    difficulty: "Intermediate",
  },

  // 9. HTML/CSS
  {
    skill: "HTML/CSS",
    question: "In the CSS Box Model, what is the correct order from outermost to innermost?",
    options: [
      "Margin -> Border -> Padding -> Content",
      "Border -> Margin -> Padding -> Content",
      "Padding -> Border -> Margin -> Content",
      "Content -> Padding -> Border -> Margin",
    ],
    correctAnswer: 0,
    explanation: "From the outside in: Margin wraps around Border, which wraps around Padding, which wraps around Content.",
    topic: "Box Model & Layout",
    difficulty: "Beginner",
  },
  {
    skill: "HTML/CSS",
    question: "What is the primary difference between CSS Grid and CSS Flexbox?",
    options: [
      "Grid is two-dimensional (rows and columns simultaneously), while Flexbox is primarily one-dimensional (either row or column)",
      "Flexbox is only for mobile devices",
      "Grid cannot handle responsive layouts",
      "Flexbox does not support alignment properties",
    ],
    correctAnswer: 0,
    explanation: "Flexbox is designed for 1-dimensional layouts (row or column), whereas CSS Grid is designed for 2-dimensional layouts (rows and columns).",
    topic: "Layouts & Flex/Grid",
    difficulty: "Intermediate",
  },

  // 10. Git
  {
    skill: "Git",
    question: "What is the difference between `git pull` and `git fetch`?",
    options: [
      "`git fetch` downloads remote commits and immediately merges them into your active branch; `git pull` does not merge",
      "`git fetch` downloads commits, files, and refs from a remote repo without merging; `git pull` does a `git fetch` followed by a `git merge`",
      "`git pull` deletes uncommitted local changes",
      "`git fetch` only works on branches created today",
    ],
    correctAnswer: 1,
    explanation: "`git fetch` updates remote tracking branches safely, while `git pull` automatically incorporates remote changes into the current branch.",
    topic: "Remote Repositories",
    difficulty: "Beginner",
  },
  {
    skill: "Git",
    question: "What is the purpose of `git rebase`?",
    options: [
      "To permanently delete git history",
      "To move or combine a sequence of commits to a new base commit, creating a linear history",
      "To clone a remote repository over SSH",
      "To create an encrypted zip archive of the repository",
    ],
    correctAnswer: 1,
    explanation: "Rebasing re-applies commits on top of another base tip to keep commit history clean and linear.",
    topic: "Branching & History",
    difficulty: "Intermediate",
  },

  // 11. AWS
  {
    skill: "AWS",
    question: "What is the fundamental difference between AWS EC2 and AWS Lambda?",
    options: [
      "EC2 is serverless; Lambda is a virtual server instance",
      "EC2 provides virtual machine instances (IaaS), while Lambda is a serverless compute service that runs code in response to events (FaaS)",
      "Lambda can only run Python code",
      "EC2 cannot connect to a VPC",
    ],
    correctAnswer: 1,
    explanation: "EC2 provides persistent virtual server instances that you configure and maintain, while Lambda runs event-driven serverless code automatically scaling on demand.",
    topic: "Compute Services",
    difficulty: "Beginner",
  },
  {
    skill: "AWS",
    question: "What is AWS IAM (Identity and Access Management) primarily used for?",
    options: [
      "Managing database backups in RDS",
      "Securely controlling access and permissions to AWS services and resources for users and roles",
      "Configuring DNS routing for web domains",
      "Monitoring CPU and memory utilization",
    ],
    correctAnswer: 1,
    explanation: "IAM allows administrators to manage access permissions, policies, and roles securely across AWS resources.",
    topic: "Security & Permissions",
    difficulty: "Intermediate",
  },
];

export const seedQuestions = async () => {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log("Seeding assessment question bank...");
      await Question.insertMany(initialQuestions);
      console.log(`Successfully seeded ${initialQuestions.length} assessment questions across 11 skills.`);
    } else {
      console.log(`Assessment question bank already contains ${count} questions.`);
    }
  } catch (error) {
    console.error("Error seeding assessment questions:", error);
  }
};
