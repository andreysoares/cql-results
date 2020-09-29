import cql from "cql-execution";
import cqlfhir from "cql-exec-fhir";

import valueSetDB from "../../data/valueset-db.json";
import { CQLlibrary } from "../../data/cql-files.json";

class UrlFriendlyCodeService extends cql.CodeService {
  findValueSetsByOid(id) {
    const [oid] = this.extractOidAndVersion(id);
    return super.findValueSetsByOid(oid);
  }

  findValueSet(id, version) {
    const [oid, embeddedVersion] = this.extractOidAndVersion(id);
    if (version == null && embeddedVersion != null) {
      version = embeddedVersion;
    }
    return super.findValueSet(oid, version);
  }

  extractOidAndVersion(id) {
    if (id == null) return [];

    // first check for VSAC FHIR URL (ideally https is preferred but support http just in case)
    // if there is a | at the end, it indicates that a version string follows
    let m = id.match(/^https?:\/\/cts\.nlm\.nih\.gov\/fhir\/ValueSet\/([^|]+)(\|(.+))?$/);
    if (m) return m[3] == null ? [m[1]] : [m[1], m[3]];

    // then check for urn:oid
    m = id.match(/^urn:oid:(.+)$/);
    if (m) return [m[1]];

    // finally just return as-is
    return [id];
  }
}

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
  return new Promise(function (resolve, reject) {
    var patientSource = cqlfhir.PatientSource.FHIRv400();
    patientSource.loadBundles([data]);

    const library = new cql.Library(
      r4FactorsELM,
      new cql.Repository(r4Repository)
    );
    const codeService = new UrlFriendlyCodeService(valueSetDB);
    const executor = new cql.Executor(library, codeService);
    const results = executor.exec(patientSource);

    resolve(results.patientResults[Object.keys(results.patientResults)[0]]);
  }).then((results) => {
    return results;
  });
};

export default cqlExec;
