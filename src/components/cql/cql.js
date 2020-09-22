import cql from "cql-execution";
import cqlfhir from "cql-exec-fhir";

import valueSetDB from "../../data/valueset-db.json";
import { CQLlibrary } from "../../data/cql-files.json";

const r4FactorsELM = require("../../data/R4/" + CQLlibrary);

// Dynamic import include libraries recursively
const includes = {};
const loadIncludes = (library) => {
  if (typeof library.includes !== "undefined") {
    library.includes.def.map(async (item) => {
      const imported = await import("../../data/R4/" + item.path)
        .then((module) => module.default)
        .catch(console.error);
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

// CQL Engine
const cqlExec = (data) => {
  var patientSource = cqlfhir.PatientSource.FHIRv400();
  patientSource.loadBundles([data]);

  const library = new cql.Library(
    r4FactorsELM,
    new cql.Repository(r4Repository)
  );
  const codeService = new cql.CodeService(valueSetDB);
  const executor = new cql.Executor(library, codeService);
  const results = executor.exec(patientSource);

  return results.patientResults[Object.keys(results.patientResults)[0]];
};

export default cqlExec;
