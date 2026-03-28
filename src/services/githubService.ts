export async function fetchRepoData(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");

  const [, owner, repo] = match;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  // Fetch file tree
  const treeRes = await fetch(`${baseUrl}/git/trees/main?recursive=1`);
  const treeData = await treeRes.json();
  const files = treeData.tree ? treeData.tree.map((f: any) => f.path) : [];

  // Fetch README
  let readmeContent = "";
  try {
    const readmeRes = await fetch(`${baseUrl}/readme`);
    const readmeData = await readmeRes.json();
    if (readmeData.content) {
      readmeContent = atob(readmeData.content);
    }
  } catch (e) {
    console.warn("README not found");
  }

  // Fetch Tags
  let tags: string[] = [];
  try {
    const tagsRes = await fetch(`${baseUrl}/tags`);
    const tagsData = await tagsRes.json();
    tags = tagsData.map((t: any) => t.name);
  } catch (e) {
    console.warn("Tags not found");
  }

  const hasLicense = files.some((f: string) => f.toLowerCase().includes("license"));
  const hasCitation = files.some((f: string) => f.toLowerCase().includes("citation.cff"));
  const hasCI = files.some((f: string) => f.includes(".github/workflows") || f.includes(".gitlab-ci.yml"));
  const hasTests = files.some((f: string) => f.toLowerCase().includes("test"));
  
  // Detect language and type
  let type: "library" | "application" | "data-science" | "unknown" = "unknown";
  let language = "unknown";

  if (files.some(f => f.endsWith(".py"))) {
    language = "Python";
    if (files.some(f => f.includes("notebook") || f.endsWith(".ipynb"))) type = "data-science";
    else if (files.some(f => f === "setup.py" || f === "pyproject.toml")) type = "library";
    else type = "application";
  } else if (files.some(f => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".tsx"))) {
    language = "JavaScript/TypeScript";
    if (files.some(f => f === "package.json")) {
      // Simple heuristic: if it has a 'src' and 'public' it might be an app
      if (files.some(f => f.startsWith("public/"))) type = "application";
      else type = "library";
    }
  } else if (files.some(f => f.endsWith(".R") || f.endsWith(".Rmd"))) {
    language = "R";
    type = "data-science";
  }

  const hasFormatting = files.some(f => 
    f.includes(".prettier") || 
    f.includes("eslint") || 
    f.includes("black") || 
    f.includes("flake8") || 
    f.includes("ruff.toml") ||
    f.includes(".editorconfig")
  );

  return {
    owner,
    repo,
    files,
    readmeContent,
    hasLicense,
    hasCitation,
    hasCI,
    hasTests,
    tags,
    language,
    type,
    hasFormatting
  };
}
