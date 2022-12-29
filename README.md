# CQL-Results SMART on FHIR App

This project was based on the AHRQ's [Pain Management Summary SMART on FHIR Application](https://github.com/AHRQ-CDS/AHRQ-CDS-Connect-PAIN-MANAGEMENT-SUMMARY).

## Setup UMLS

You need a NLM UMLS account and a UMLS API KEY to be able to update the value set DB. Visit the [NLM UMLS](https://www.nlm.nih.gov/research/umls/index.html) to request a license.

Setup the UMLS_USER_NAME and UMLS_API_KEY as environment variables.

For Mac/Linux:

```
$ export UMLS_USER_NAME=myusername
$ export UMLS_API_KEY=myapikey
```

For Windows:

```
$ export UMLS_USER_NAME=myusername
$ export UMLS_API_KEY=myapikey
```

## Clone the repository

```
git clone https://github.com/andreysoares/cql-results.git
```

## To build and run in development mode:

- Install Node.js 
- Install Yarn
- Install temp with `yarn add temp`
- Install dependencies with `yarn`
- Run `yarn start` from the root directory

## Using Docker-Compose

To build the Docker image:

```
$ docker-compose up -d
```

## Launching the App

Server runs on port 3000 in development mode and port 7000 from the docker-compose. Launch the application with [SMART on FHIR Launcher](https://launch.smarthealthit.org). Use the App launch URL: http://localhost:3000/launch

## Target CQL file

The app uses the cql file listed in the file `src/data/cql-files.json`.

If you modify any of the CQL files, you must convert the file from CQL to ELM (JSON file) and update the valuse set DB (see below). 

NOTE: If you change the content of the ```cql-files.json```, the app will automatically process the patient data against the logic of the cql file informed.

## Value Set DB

If you change the CQL library in use, update the value set DB based. From the ```src/utils``` folder type:

```
node updateValuseSetDB.js
```

The system will get the current/default library from the ```cql-files.json``` and will read all mentions of valueset within the equivalent json file stored in the ```src/data/R4``` folder. 

For each valueset, the system will search it using the VSAC API and return the corresponding list of codes. The codes are stored in the ```valueset-db.json``` file.  For example, the hypertension valueset ```2.16.840.1.113762.1.4.1032.9``` returns SNOMED and ICD codes.
```
{
  "2.16.840.1.113762.1.4.1032.9": {
    "Latest": [
      {
        "code": "10725009",
        "system": "http://snomed.info/sct",
        "version": "2022-09"
      },
      {
        "code": "1078301000112109",
        "system": "http://snomed.info/sct",
        "version": "2022-09"
      },
      {
        "code": "111438007",
        "system": "http://snomed.info/sct",
        "version": "2022-09"
      },
      ...
```

