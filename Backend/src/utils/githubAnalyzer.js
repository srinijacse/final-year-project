/**
 * SkillSwap GitHub Portfolio Evidence Analyzer
 *
 * Analyzes public GitHub repositories to find concrete evidence
 * of claimed skills.
 *
 * IMPORTANT:
 * 1. The repository must be public.
 * 2. The repository owner must match the GitHub profile
 *    linked to the user's SkillSwap profile.
 * 3. The selected skill must have real repository evidence.
 * 4. The analyzer checks the COMPLETE repository tree,
 *    including nested folders such as frontend/src.
 */

export const analyzeGitHubRepository = async (
  repoInput,
  skillName,
  user
) => {
  try {
    // =========================================================
    // 0. BASIC INPUT VALIDATION
    // =========================================================

    if (!repoInput || typeof repoInput !== "string") {
      throw new Error(
        "Please provide a valid GitHub repository URL."
      );
    }

    if (!skillName || typeof skillName !== "string") {
      throw new Error(
        "Please provide a valid skill name."
      );
    }

    if (!user || typeof user !== "object") {
      throw new Error(
        "Unable to verify the GitHub profile."
      );
    }

    // =========================================================
    // CONSTANTS
    // =========================================================

    const validPart = /^[a-zA-Z0-9._-]+$/;

    const headers = {
      "User-Agent": "SkillSwap-Analyzer",
      Accept: "application/vnd.github+json",
    };

    // =========================================================
    // HELPER: PARSE GITHUB REPOSITORY URL
    // =========================================================

    const parseGitHubRepository = (input) => {
      let value = input.trim();

      if (!value) {
        throw new Error(
          "Please provide a valid GitHub repository URL."
        );
      }

      // -------------------------------------------------------
      // Full URL
      // -------------------------------------------------------

      if (/^https?:\/\//i.test(value)) {
        let url;

        try {
          url = new URL(value);
        } catch {
          throw new Error(
            "Please provide a valid GitHub repository URL."
          );
        }

        const hostname = url.hostname
          .toLowerCase()
          .replace(/^www\./, "");

        if (hostname !== "github.com") {
          throw new Error(
            "Please provide a valid GitHub repository URL."
          );
        }

        if (url.username || url.password) {
          throw new Error(
            "Invalid GitHub repository URL."
          );
        }

        const pathParts = url.pathname
          .split("/")
          .filter(Boolean);

        if (pathParts.length !== 2) {
          throw new Error(
            "Repository URL must be in format https://github.com/owner/repo."
          );
        }

        const owner = pathParts[0];

        const repo = pathParts[1].replace(
          /\.git$/i,
          ""
        );

        if (
          !validPart.test(owner) ||
          !validPart.test(repo)
        ) {
          throw new Error(
            "Invalid GitHub repository URL."
          );
        }

        return {
          owner,
          repo,
        };
      }

      // -------------------------------------------------------
      // Protocol-less URL
      // -------------------------------------------------------

      value = value
        .replace(/^www\./i, "")
        .replace(/^github\.com\//i, "");

      value = value.split("?")[0];
      value = value.split("#")[0];

      value = value.replace(/\/+$/, "");

      // Reject other Git hosting services
      if (
        value.includes("://") ||
        value
          .toLowerCase()
          .startsWith("gitlab.com/") ||
        value
          .toLowerCase()
          .startsWith("bitbucket.org/")
      ) {
        throw new Error(
          "Please provide a valid GitHub repository URL."
        );
      }

      const parts = value
        .split("/")
        .filter(Boolean);

      if (parts.length !== 2) {
        throw new Error(
          "Repository URL must be in format github.com/owner/repo or owner/repo."
        );
      }

      const owner = parts[0];

      const repo = parts[1].replace(
        /\.git$/i,
        ""
      );

      if (
        !validPart.test(owner) ||
        !validPart.test(repo)
      ) {
        throw new Error(
          "Invalid GitHub repository URL."
        );
      }

      return {
        owner,
        repo,
      };
    };

    // =========================================================
    // HELPER: PARSE GITHUB PROFILE URL
    // =========================================================

    const parseGitHubProfile = (input) => {
      let value = input.trim();

      if (!value) {
        throw new Error(
          "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
        );
      }

      // -------------------------------------------------------
      // Full URL
      // -------------------------------------------------------

      if (/^https?:\/\//i.test(value)) {
        let url;

        try {
          url = new URL(value);
        } catch {
          throw new Error(
            "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
          );
        }

        const hostname = url.hostname
          .toLowerCase()
          .replace(/^www\./, "");

        if (hostname !== "github.com") {
          throw new Error(
            "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
          );
        }

        if (url.username || url.password) {
          throw new Error(
            "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
          );
        }

        const parts = url.pathname
          .split("/")
          .filter(Boolean);

        if (parts.length !== 1) {
          throw new Error(
            "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
          );
        }

        const username = parts[0];

        if (!validPart.test(username)) {
          throw new Error(
            "Invalid GitHub profile username. Please edit your profile and add a valid GitHub profile link."
          );
        }

        return username;
      }

      // -------------------------------------------------------
      // Protocol-less profile
      // -------------------------------------------------------

      value = value
        .replace(/^www\./i, "")
        .replace(/^github\.com\//i, "");

      value = value.split("?")[0];
      value = value.split("#")[0];

      value = value.replace(/\/+$/, "");

      const parts = value
        .split("/")
        .filter(Boolean);

      if (parts.length !== 1) {
        throw new Error(
          "Invalid GitHub profile URL. Please edit your profile and add a valid GitHub profile link."
        );
      }

      const username = parts[0];

      if (!validPart.test(username)) {
        throw new Error(
          "Invalid GitHub profile username. Please edit your profile and add a valid GitHub profile link."
        );
      }

      return username;
    };

    // =========================================================
    // 1. PARSE REPOSITORY
    // =========================================================

    const {
      owner,
      repo,
    } = parseGitHubRepository(repoInput);

    const fullRepoName = `${owner}/${repo}`;

    const fullRepoUrl =
      `https://github.com/${owner}/${repo}`;

    // =========================================================
    // 2. GITHUB PROFILE MUST EXIST IN USER
    // =========================================================

    if (
      !user.githubLink ||
      typeof user.githubLink !== "string"
    ) {
      throw new Error(
        "Please add your GitHub profile URL to your profile before submitting a repository."
      );
    }

    // =========================================================
    // 3. PARSE USER GITHUB PROFILE
    // =========================================================

    const profileUsername =
      parseGitHubProfile(user.githubLink);

    // =========================================================
    // 4. VERIFY OWNER MATCHES PROFILE
    // =========================================================

    if (
      profileUsername.toLowerCase() !==
      owner.toLowerCase()
    ) {
      throw new Error(
        `GitHub repository rejected. The repository belongs to "${owner}", but your SkillSwap profile is linked to GitHub user "${profileUsername}". Please submit a repository owned by your GitHub account.`
      );
    }

    // =========================================================
    // VARIABLES
    // =========================================================

    let repoMeta = null;

    let languages = {};

    let readmeText = "";

    let treeFiles = [];

    let packageJsonFiles = [];

    /*
     * IMPORTANT:
     * packageObjects is declared here so it is available
     * throughout the complete analyzer function.
     */
    let packageObjects = [];

    // =========================================================
    // 5. VERIFY REPOSITORY
    // =========================================================

    try {
      const metaRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(
          owner
        )}/${encodeURIComponent(repo)}`,
        {
          headers,
        }
      );

      // -------------------------------------------------------
      // Repository does not exist
      // -------------------------------------------------------

      if (!metaRes.ok) {
        if (metaRes.status === 404) {
          throw new Error(
            "GitHub repository not found. Please enter a valid public repository URL."
          );
        }

        if (metaRes.status === 403) {
          throw new Error(
            "GitHub API access was denied or rate limited. Please try again later."
          );
        }

        if (metaRes.status === 401) {
          throw new Error(
            "GitHub API authentication failed."
          );
        }

        throw new Error(
          "Unable to access the GitHub repository. Please check the repository URL."
        );
      }

      repoMeta = await metaRes.json();

      // =====================================================
      // 6. VERIFY ACTUAL OWNER FROM GITHUB
      // =====================================================

      if (
        !repoMeta.owner ||
        !repoMeta.owner.login
      ) {
        throw new Error(
          "GitHub repository ownership could not be verified."
        );
      }

      if (
        repoMeta.owner.login.toLowerCase() !==
        profileUsername.toLowerCase()
      ) {
        throw new Error(
          `GitHub repository ownership verification failed. The repository is owned by "${repoMeta.owner.login}", but your SkillSwap profile is linked to "${profileUsername}".`
        );
      }

      // =====================================================
      // 7. VERIFY PUBLIC REPOSITORY
      // =====================================================

      if (
        repoMeta.private === true ||
        repoMeta.visibility === "private"
      ) {
        throw new Error(
          "Private GitHub repositories cannot be analyzed. Please provide a public repository."
        );
      }

      if (
        repoMeta.visibility &&
        repoMeta.visibility !== "public"
      ) {
        throw new Error(
          "Only public GitHub repositories can be analyzed."
        );
      }

      // =====================================================
      // 8. DEFAULT BRANCH
      // =====================================================

      const defaultBranch =
        repoMeta.default_branch || "main";

      // =====================================================
      // 9. FETCH LANGUAGES
      // =====================================================

      try {
        const langRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(
            owner
          )}/${encodeURIComponent(
            repo
          )}/languages`,
          {
            headers,
          }
        );

        if (langRes.ok) {
          languages = await langRes.json();
        }
      } catch (error) {
        console.log(
          "Unable to fetch languages:",
          error.message
        );

        languages = {};
      }

      // =====================================================
      // 10. FETCH COMPLETE REPOSITORY TREE
      // =====================================================

      /*
       * We use the Git Trees API with recursive=1.
       *
       * This allows detection of files inside nested folders:
       *
       * frontend/package.json
       * frontend/src/App.jsx
       * frontend/src/main.jsx
       * backend/package.json
       * backend/controllers/userController.js
       * backend/routes/authRoutes.js
       */

      try {
        const treeRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(
            owner
          )}/${encodeURIComponent(
            repo
          )}/git/trees/${encodeURIComponent(
            defaultBranch
          )}?recursive=1`,
          {
            headers,
          }
        );

        if (treeRes.ok) {
          const treeData =
            await treeRes.json();

          if (
            Array.isArray(treeData.tree)
          ) {
            treeFiles = treeData.tree
              .filter(
                (item) =>
                  item &&
                  item.type === "blob" &&
                  typeof item.path === "string"
              )
              .map((item) =>
                item.path.toLowerCase()
              );
          }

          if (treeData.truncated) {
            console.log(
              "GitHub repository tree was truncated."
            );
          }
        } else {
          console.log(
            "Unable to fetch complete repository tree."
          );
        }
      } catch (treeError) {
        console.log(
          "Repository tree error:",
          treeError.message
        );

        treeFiles = [];
      }

      // =====================================================
      // 11. FIND ALL PACKAGE.JSON FILES
      // =====================================================

      packageJsonFiles = treeFiles.filter(
        (file) =>
          file === "package.json" ||
          file.endsWith("/package.json")
      );

      // =====================================================
      // 12. FETCH ALL PACKAGE.JSON FILES
      // =====================================================

      /*
       * IMPORTANT:
       *
       * packageObjects was already declared above.
       *
       * DO NOT declare:
       *
       * const packageObjects = [];
       *
       * here.
       *
       * We simply populate the existing array.
       */

      for (const packagePath of packageJsonFiles) {
        try {
          const packageUrl =
            `https://raw.githubusercontent.com/${encodeURIComponent(
              owner
            )}/${encodeURIComponent(
              repo
            )}/${encodeURIComponent(
              defaultBranch
            )}/${packagePath
              .split("/")
              .map((part) =>
                encodeURIComponent(part)
              )
              .join("/")}`;

          const pkgRes =
            await fetch(packageUrl);

          if (pkgRes.ok) {
            const pkg =
              await pkgRes.json();

            if (
              pkg &&
              typeof pkg === "object"
            ) {
              packageObjects.push(pkg);
            }
          }
        } catch (packageError) {
          console.log(
            `Unable to read ${packagePath}:`,
            packageError.message
          );
        }
      }

      // =====================================================
      // 13. FETCH README
      // =====================================================

      /*
       * Try README.md at root first.
       */

      try {
        const readmeUrl =
          `https://raw.githubusercontent.com/${encodeURIComponent(
            owner
          )}/${encodeURIComponent(
            repo
          )}/${encodeURIComponent(
            defaultBranch
          )}/README.md`;

        const readmeRes =
          await fetch(readmeUrl);

        if (readmeRes.ok) {
          readmeText =
            await readmeRes.text();
        }
      } catch (readmeError) {
        console.log(
          "README not available:",
          readmeError.message
        );
      }
    } catch (apiErr) {
      console.log(
        "GitHub API request error:",
        apiErr.message
      );

      throw new Error(
        apiErr.message ||
          "Could not access or analyze the GitHub repository."
      );
    }

    // =========================================================
    // 14. SAFETY CHECK
    // =========================================================

    if (!repoMeta) {
      throw new Error(
        "Could not verify the GitHub repository. Please provide a valid public repository."
      );
    }

    // =========================================================
    // 15. COMBINE ALL DEPENDENCIES
    // =========================================================

    const allDeps = {};

    for (const pkg of packageObjects) {
      Object.assign(
        allDeps,
        pkg.dependencies || {},
        pkg.devDependencies || {},
        pkg.peerDependencies || {}
      );
    }

    const depNames =
      Object.keys(allDeps).map((d) =>
        d.toLowerCase()
      );

    // =========================================================
    // SETS / VARIABLES
    // =========================================================

    const detectedTech = new Set();

    const evidenceItems = [];

    let baseScore = 60;

    const normSkill =
      skillName
        .toLowerCase()
        .trim();

    const lowerReadme =
      readmeText.toLowerCase();

    const langNames =
      Object.keys(languages).map(
        (l) =>
          l.toLowerCase()
      );

    let skillEvidenceFound = false;

    // =========================================================
    // HELPERS
    // =========================================================

    const hasFile = (fileName) =>
      treeFiles.some(
        (file) =>
          file ===
          fileName.toLowerCase()
      );

    const hasFileExtension =
      (extension) =>
        treeFiles.some(
          (file) =>
            file.endsWith(
              extension.toLowerCase()
            )
        );

    const hasFileContaining =
      (text) =>
        treeFiles.some(
          (file) =>
            file.includes(
              text.toLowerCase()
            )
        );

    // =========================================================
    // 16. REACT
    // =========================================================

    if (
      normSkill.includes("react")
    ) {
      let reactFound = false;

      // -------------------------------------------------------
      // Strong React dependency evidence
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "react"
        )
      ) {
        detectedTech.add(
          "React"
        );

        evidenceItems.push(
          "✓ React framework detected in project dependencies"
        );

        baseScore += 15;

        skillEvidenceFound = true;

        reactFound = true;
      }

      // -------------------------------------------------------
      // React DOM
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "react-dom"
        )
      ) {
        detectedTech.add(
          "React DOM"
        );

        if (!reactFound) {
          detectedTech.add(
            "React"
          );

          evidenceItems.push(
            "✓ React DOM dependency confirms React application usage"
          );

          baseScore += 15;

          skillEvidenceFound = true;

          reactFound = true;
        }
      }

      // -------------------------------------------------------
      // Next.js
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "next"
        )
      ) {
        detectedTech.add(
          "Next.js"
        );

        detectedTech.add(
          "React"
        );

        evidenceItems.push(
          "✓ React-based Next.js framework detected"
        );

        baseScore += 15;

        skillEvidenceFound = true;

        reactFound = true;
      }

      // -------------------------------------------------------
      // React Router
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d ===
              "react-router" ||
            d ===
              "react-router-dom"
        )
      ) {
        detectedTech.add(
          "React Router"
        );

        evidenceItems.push(
          "✓ React Router dependency detected"
        );

        baseScore += 5;

        if (!reactFound) {
          detectedTech.add(
            "React"
          );

          evidenceItems.push(
            "✓ React Router confirms React application usage"
          );

          baseScore += 10;

          skillEvidenceFound = true;

          reactFound = true;
        }
      }

      // -------------------------------------------------------
      // Vite
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "vite"
        )
      ) {
        detectedTech.add(
          "Vite"
        );
      }

      // -------------------------------------------------------
      // API integration
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "axios" ||
            d.includes(
              "react-query"
            ) ||
            d.includes(
              "@tanstack/react-query"
            )
        )
      ) {
        detectedTech.add(
          "API Integration"
        );

        evidenceItems.push(
          "✓ API client integration detected"
        );

        baseScore += 5;
      }

      // -------------------------------------------------------
      // State management
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d.includes(
              "redux"
            ) ||
            d === "zustand" ||
            d === "recoil" ||
            d === "jotai"
        )
      ) {
        detectedTech.add(
          "State Management"
        );

        evidenceItems.push(
          "✓ State management library detected"
        );

        baseScore += 5;
      }

      // -------------------------------------------------------
      // CSS/UI
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d.includes(
              "tailwind"
            ) ||
            d.includes(
              "bootstrap"
            ) ||
            d.includes(
              "styled-components"
            ) ||
            d.includes(
              "@emotion"
            )
        )
      ) {
        detectedTech.add(
          "UI / CSS Framework"
        );
      }

      // -------------------------------------------------------
      // React file evidence
      // -------------------------------------------------------

      const hasReactFiles =
        hasFileExtension(".jsx") ||
        hasFileExtension(".tsx");

      /*
       * JSX/TSX alone is not enough to verify React.
       *
       * But if React dependency evidence exists,
       * JSX/TSX strengthens the result.
       */

      if (
        reactFound &&
        hasReactFiles
      ) {
        evidenceItems.push(
          "✓ JSX/TSX component files found in repository"
        );

        baseScore += 5;
      }

      // -------------------------------------------------------
      // React source structure
      // -------------------------------------------------------

      const hasReactSourceStructure =
        hasFileContaining(
          "/src/"
        ) &&
        hasReactFiles;

      if (
        reactFound &&
        hasReactSourceStructure
      ) {
        evidenceItems.push(
          "✓ React component source structure detected"
        );

        baseScore += 5;
      }
    }

    // =========================================================
    // 17. NODE.JS / EXPRESS
    // =========================================================

    else if (
      normSkill.includes("node") ||
      normSkill.includes("express")
    ) {
      const hasExpress =
        depNames.some(
          (d) =>
            d === "express"
        );

      const hasNodeBackendDependency =
        hasExpress ||
        depNames.some(
          (d) =>
            d === "mongoose" ||
            d === "mongodb" ||
            d === "jsonwebtoken" ||
            d === "socket.io" ||
            d === "cors"
        );

      if (hasExpress) {
        detectedTech.add(
          "Express.js"
        );

        evidenceItems.push(
          "✓ Express.js web server and routing framework detected"
        );

        baseScore += 15;

        skillEvidenceFound = true;
      }

      // -------------------------------------------------------
      // MongoDB
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "mongoose" ||
            d === "mongodb"
        )
      ) {
        detectedTech.add(
          "MongoDB / Mongoose"
        );

        evidenceItems.push(
          "✓ Database ODM and data models configured"
        );

        baseScore += 10;
      }

      // -------------------------------------------------------
      // Authentication
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "jsonwebtoken" ||
            d === "bcrypt" ||
            d === "bcryptjs"
        )
      ) {
        detectedTech.add(
          "JWT Authentication"
        );

        evidenceItems.push(
          "✓ Authentication dependency detected"
        );

        baseScore += 5;
      }

      // -------------------------------------------------------
      // Socket.io
      // -------------------------------------------------------

      if (
        depNames.some(
          (d) =>
            d === "socket.io"
        )
      ) {
        detectedTech.add(
          "Socket.io (WebSockets)"
        );

        evidenceItems.push(
          "✓ Real-time WebSockets integration detected"
        );

        baseScore += 5;
      }

      // -------------------------------------------------------
      // Node backend files
      // -------------------------------------------------------

      const hasNodeFiles =
        hasFile("server.js") ||
        hasFile("app.js") ||
        hasFile("index.js") ||
        hasFile("server.ts") ||
        hasFile("app.ts") ||
        hasFile("index.ts") ||
        hasFileContaining(
          "server/"
        ) ||
        hasFileContaining(
          "controllers/"
        ) ||
        hasFileContaining(
          "routes/"
        );

      if (
        hasNodeBackendDependency &&
        hasNodeFiles
      ) {
        detectedTech.add(
          "Node.js Runtime"
        );

        evidenceItems.push(
          "✓ Node.js backend structure and server-side dependencies detected"
        );

        baseScore += 5;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 18. MONGODB
    // =========================================================

    else if (
      normSkill.includes("mongo")
    ) {
      const hasMongoDependency =
        depNames.some(
          (d) =>
            d === "mongoose" ||
            d === "mongodb"
        );

      const hasMongoFiles =
        hasFileContaining(
          "mongo"
        ) ||
        hasFileContaining(
          "mongoose"
        );

      if (
        hasMongoDependency
      ) {
        detectedTech.add(
          "MongoDB / Mongoose"
        );

        evidenceItems.push(
          "✓ MongoDB/Mongoose dependency detected"
        );

        baseScore += 20;

        skillEvidenceFound = true;

        detectedTech.add(
          "NoSQL Database"
        );
      } else if (
        hasMongoFiles &&
        (
          langNames.includes(
            "javascript"
          ) ||
          langNames.includes(
            "typescript"
          )
        )
      ) {
        detectedTech.add(
          "MongoDB"
        );

        evidenceItems.push(
          "✓ MongoDB-related repository files detected"
        );

        baseScore += 15;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 19. PYTHON
    // =========================================================

    else if (
      normSkill.includes("python")
    ) {
      const hasPythonLanguage =
        langNames.includes(
          "python"
        );

      const hasPythonFiles =
        hasFileExtension(".py");

      const hasPythonDependencyFile =
        hasFile(
          "requirements.txt"
        ) ||
        hasFile(
          "pipfile"
        ) ||
        hasFile(
          "pyproject.toml"
        ) ||
        hasFile(
          "setup.py"
        );

      if (
        hasPythonLanguage ||
        hasPythonFiles ||
        hasPythonDependencyFile
      ) {
        detectedTech.add(
          "Python 3"
        );

        evidenceItems.push(
          "✓ Python codebase and dependency specifications detected"
        );

        baseScore += 15;

        skillEvidenceFound = true;
      }

      const hasPythonFramework =
        depNames.some(
          (d) =>
            d.includes("django") ||
            d.includes("flask") ||
            d.includes("fastapi")
        ) ||
        lowerReadme.includes(
          "django"
        ) ||
        lowerReadme.includes(
          "flask"
        ) ||
        lowerReadme.includes(
          "fastapi"
        );

      if (
        hasPythonFramework &&
        (
          hasPythonLanguage ||
          hasPythonFiles
        )
      ) {
        detectedTech.add(
          "Python Web Framework"
        );

        evidenceItems.push(
          "✓ Python backend web framework detected"
        );

        baseScore += 10;

        skillEvidenceFound = true;
      }

      const hasMLLibraries =
        depNames.some(
          (d) =>
            d.includes("pandas") ||
            d.includes("numpy") ||
            d.includes("torch") ||
            d.includes("tensorflow") ||
            d.includes("scikit-learn")
        );

      if (
        hasMLLibraries
      ) {
        detectedTech.add(
          "Data Science & ML Libraries"
        );

        evidenceItems.push(
          "✓ Machine learning and scientific computing packages identified"
        );

        baseScore += 10;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 20. SQL
    // =========================================================

    else if (
      normSkill.includes("sql")
    ) {
      const hasSqlFiles =
        hasFileExtension(".sql");

      const hasDatabaseFiles =
        hasFileContaining(
          "schema"
        ) ||
        hasFileContaining(
          "migration"
        ) ||
        hasFileContaining(
          "database"
        );

      const hasSqlDependency =
        depNames.some(
          (d) =>
            d.includes("mysql") ||
            d === "pg" ||
            d.includes("postgres") ||
            d.includes("sequelize") ||
            d.includes("prisma") ||
            d.includes("typeorm")
        );

      if (
        hasSqlFiles ||
        hasDatabaseFiles ||
        hasSqlDependency ||
        langNames.includes("sql")
      ) {
        detectedTech.add(
          "SQL / Relational DB"
        );

        evidenceItems.push(
          "✓ Relational database queries and schema definitions detected"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 21. JAVA
    // =========================================================

    else if (
      normSkill.includes("java")
    ) {
      const hasJavaLanguage =
        langNames.includes(
          "java"
        );

      const hasJavaFiles =
        hasFileExtension(".java");

      const hasJavaBuildFiles =
        hasFile("pom.xml") ||
        hasFile("build.gradle") ||
        hasFile("build.gradle.kts") ||
        hasFile("gradlew");

      if (
        hasJavaLanguage ||
        hasJavaFiles ||
        hasJavaBuildFiles
      ) {
        detectedTech.add(
          "Java"
        );

        evidenceItems.push(
          "✓ Java source modules and build configuration detected"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }

      const hasSpring =
        depNames.some(
          (d) =>
            d.includes("spring")
        ) ||
        lowerReadme.includes(
          "spring boot"
        ) ||
        lowerReadme.includes(
          "springboot"
        );

      if (
        hasSpring &&
        (
          hasJavaLanguage ||
          hasJavaFiles
        )
      ) {
        detectedTech.add(
          "Spring Boot"
        );

        evidenceItems.push(
          "✓ Spring Boot enterprise framework detected"
        );

        baseScore += 10;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 22. AWS / CLOUD
    // =========================================================

    else if (
      normSkill.includes("aws") ||
      normSkill.includes("cloud")
    ) {
      const hasAwsDependency =
        depNames.some(
          (d) =>
            d.includes("aws-sdk") ||
            d.includes("@aws-sdk")
        );

      const hasAwsFiles =
        hasFileContaining(
          "serverless"
        ) ||
        hasFileContaining(
          "cloudformation"
        ) ||
        hasFileContaining(
          "terraform"
        );

      const hasAwsConfig =
        hasFile(
          "template.yaml"
        ) ||
        hasFile(
          "template.yml"
        ) ||
        hasFile(
          "serverless.yml"
        ) ||
        hasFile(
          "serverless.yaml"
        );

      if (
        hasAwsDependency
      ) {
        detectedTech.add(
          "AWS SDK"
        );

        evidenceItems.push(
          "✓ AWS SDK service integration detected"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      } else if (
        hasAwsFiles ||
        hasAwsConfig
      ) {
        detectedTech.add(
          "AWS Cloud"
        );

        evidenceItems.push(
          "✓ Cloud architecture and deployment configuration identified"
        );

        baseScore += 15;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 23. GIT
    // =========================================================

    else if (
      normSkill === "git"
    ) {
      detectedTech.add(
        "Git Version Control"
      );

      evidenceItems.push(
        "✓ GitHub repository and version control evidence identified"
      );

      baseScore += 20;

      skillEvidenceFound = true;
    }

    // =========================================================
    // 24. HTML / CSS
    // =========================================================

    else if (
      normSkill.includes("html") ||
      normSkill.includes("css")
    ) {
      const hasHtml =
        langNames.includes(
          "html"
        ) ||
        hasFileExtension(
          ".html"
        );

      const hasCss =
        langNames.includes(
          "css"
        ) ||
        hasFileExtension(
          ".css"
        );

      if (
        normSkill.includes("html") &&
        hasHtml
      ) {
        detectedTech.add(
          "HTML5"
        );

        evidenceItems.push(
          "✓ HTML5 markup detected in repository"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }

      if (
        normSkill.includes("css") &&
        hasCss
      ) {
        detectedTech.add(
          "CSS3"
        );

        evidenceItems.push(
          "✓ CSS styling detected in repository"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 25. JAVASCRIPT
    // =========================================================

    else if (
      normSkill === "javascript" ||
      normSkill === "js"
    ) {
      const hasJavaScript =
        langNames.includes(
          "javascript"
        ) ||
        hasFileExtension(
          ".js"
        ) ||
        hasFileExtension(
          ".jsx"
        );

      if (
        hasJavaScript
      ) {
        detectedTech.add(
          "JavaScript"
        );

        evidenceItems.push(
          "✓ JavaScript source code detected in repository"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 26. TYPESCRIPT
    // =========================================================

    else if (
      normSkill === "typescript" ||
      normSkill === "ts"
    ) {
      const hasTypeScript =
        langNames.includes(
          "typescript"
        ) ||
        hasFileExtension(
          ".ts"
        ) ||
        hasFileExtension(
          ".tsx"
        );

      if (
        hasTypeScript
      ) {
        detectedTech.add(
          "TypeScript"
        );

        evidenceItems.push(
          "✓ TypeScript source code detected in repository"
        );

        baseScore += 20;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 27. OTHER SKILLS
    // =========================================================

    else {
      const skillLower =
        normSkill;

      const skillFoundInDependencies =
        depNames.some(
          (d) =>
            d === skillLower ||
            d.includes(
              skillLower
            )
        );

      const skillFoundInLanguages =
        langNames.some(
          (l) =>
            l === skillLower
        );

      const skillFoundInFiles =
        treeFiles.some(
          (f) =>
            f.includes(
              skillLower
            )
        );

      if (
        skillFoundInDependencies ||
        skillFoundInLanguages ||
        skillFoundInFiles
      ) {
        detectedTech.add(
          skillName
        );

        evidenceItems.push(
          `✓ Project repository evidence related to ${skillName} identified`
        );

        baseScore += 15;

        skillEvidenceFound = true;
      }
    }

    // =========================================================
    // 28. README BONUS
    // =========================================================

    /*
     * README improves score.
     *
     * README alone NEVER verifies a skill.
     */

    if (
      readmeText.length > 50
    ) {
      evidenceItems.push(
        "✓ Comprehensive project README and documentation available"
      );

      baseScore += 5;
    }

    // =========================================================
    // 29. STAR BONUS
    // =========================================================

    if (
      repoMeta?.stargazers_count > 0
    ) {
      baseScore += 3;
    }

    // =========================================================
    // 30. CRITICAL SKILL VERIFICATION
    // =========================================================

    if (
      !skillEvidenceFound
    ) {
      throw new Error(
        `The repository is valid, but no sufficient evidence for "${skillName}" was found. Please provide a repository that demonstrates this skill.`
      );
    }

    // =========================================================
    // 31. FINAL SCORE
    // =========================================================

    const finalScore =
      Math.min(
        Math.max(
          baseScore,
          0
        ),
        98
      );

    // =========================================================
    // 32. DETECTED TECHNOLOGIES
    // =========================================================

    const techArray =
      Array.from(
        detectedTech
      );

    if (
      techArray.length === 0
    ) {
      techArray.push(
        skillName,
        "Git"
      );
    }

    // =========================================================
    // 33. SUCCESS RESULT
    // =========================================================

    return {
      success: true,

      repoName:
        fullRepoName,

      repoUrl:
        fullRepoUrl,

      githubUsername:
        profileUsername,

      score:
        finalScore,

      skill:
        skillName,

      detectedTech:
        techArray,

      evidenceItems:
        evidenceItems.length > 0
          ? evidenceItems
          : [
              `✓ ${skillName} project evidence detected in repository structure`,
            ],

      analyzedAt:
        new Date(),
    };
  } catch (error) {
    console.log(
      "GitHub Portfolio Analyzer Error:",
      error.message
    );

    return {
      success: false,

      error:
        error.message ||
        "Failed to analyze GitHub repository.",
    };
  }
};