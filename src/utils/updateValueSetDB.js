/*
SOURCE CODE ADAPTED FROM: AHRQ-CDS-Connect-PAIN-MANAGEMENT-SUMMARY
https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-PAIN-MANAGEMENT-SUMMARY
*/

// This script updates the valueset-db.json file with any changes from the CQL
// library and/or changes in the value set definitions in VSAC.  It should be
// called with the UMLS arguments.
const fs = require("fs");
const path = require("path");
const temp = require("temp");
const { Library, Repository } = require("cql-execution");
const { CodeService } = require("cql-exec-vsac");

const { CQLlibrary } = require("../data/cql-files.json");

if (typeof CQLlibrary === "undefined") {
  console.error("ELM libraries not defined in cql-files.json.");
  process.exit(1);
}

const r4FactorsELM = require("../data/R4/" + CQLlibrary);

// Require all JSON files from data/R4 folder
require("fs")
  .readdirSync(path.join(__dirname, "..", "data", "R4"))
  .forEach(function (file) {
    if (file.match(/\.json$/) !== null) {
      var name = file.replace(".json", "");
      exports[name] = require("../data/R4/" + file);
    }
  });

// Include libraries recursively
const includes = {};
const loadIncludes = (library) => {
  if (typeof library.includes !== "undefined") {
    library.includes.def.map((item) => {
      const imported = exports[item.path];
      includes[item.path] = imported;
      if (typeof imported.library.includes !== "undefined") {
        loadIncludes(imported.library);
      }
    });
  }
  return includes;
};

// Load includes
const r4Repository = loadIncludes(r4FactorsELM.library);

// First ensure username and password are set as environment variables.
// Use EXPORT for Mac/Linux and SET for Windows. For example:
// export UMLS_USER_NAME=myusername
// export UMLS_API_KEY=myapikey
const UMLS_USER_NAME = process.env.UMLS_USER_NAME;
const UMLS_API_KEY = process.env.UMLS_API_KEY;

if (typeof UMLS_USER_NAME === "undefined" || typeof UMLS_API_KEY === "undefined") {
  console.error(
    "The UMLS_USER_NAME and/or UMLS_API_KEY are not set as environment variables"
  );
  process.exit(1);
}

// Then initialize the cql-exec-vsac CodeService, pointing to a temporary
// folder to dump the valueset cache files.
temp.track(); // track temporary files and delete them when the process exits
const tempFolder = temp.mkdirSync("vsac-cache");
const codeService = new CodeService(tempFolder);

console.log(`Using temp folder: ${tempFolder}`);

// Then setup the CQL libraries that we need to analyze to extract the
// valuesets from.

const r4Lib = new Library(r4FactorsELM, new Repository(r4Repository));

// Then use the ensureValueSetsInLibrary function to analyze the Pain
// Management Summary CQL, request all the value sets from VSAC, and store
// their data in the temporary folder.  The second argument (true)
// indicates to also look at dependency libraries.  This has no affect
// for the current CQL, but may be helpful for people who extend it.

console.log(`Loading value sets from VSAC using account: ${UMLS_USER_NAME}`);

codeService
  .ensureValueSetsInLibraryWithAPIKey(r4Lib, true, UMLS_API_KEY)
  .then(() => {
    // The valueset-db.json that the codeService produces isn't exactly the
    // format that the Pain Management Summary wants, so now we must reformat
    // it into the desired format.
    const tempDBFile = path.join(tempFolder, "valueset-db.json");
    const original = JSON.parse(fs.readFileSync(tempDBFile, "utf8"));
    let oidKeys = Object.keys(original).sort();

    console.log(`Loaded ${oidKeys.length} value sets`);
    console.log("Translating JSON to expected format");

    const fixed = {};
    for (const oid of oidKeys) {
      fixed[oid] = {};
      for (const version of Object.keys(original[oid])) {
        fixed[oid][version] = original[oid][version]["codes"].sort((a, b) => {
          if (a.code < b.code) return -1;
          else if (a.code > b.code) return 1;
          return 0;
        });
      }
    }

    // And finally write the result to the real locations of the valueset-db.json.
    const dbPath = path.join(__dirname, "..", "data", "valueset-db.json");
    fs.writeFileSync(dbPath, JSON.stringify(fixed, null, 2), "utf8");

    console.log("Updated:", dbPath);
  })
  .catch((error) => {
    let message = error.message;
    if (error.statusCode === 401) {
      // The default 401 message isn't helpful at all
      message = "invalid UMLS credentials or unauthorized access";
    }

    console.error("Error updating valueset-db.json:", message);

    process.exit(1);
  });
