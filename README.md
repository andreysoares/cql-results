# CQL-Results SMARTonFHIR App

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

- Install Node.js (12.19.0)
- Install Yarn (1.22.10)
- Install temp with `yarn add temp`
- Install dependencies with `yarn`
- Run `yarn start` from the root directory

## Using Docker-Compose

To build the Docker image:

```
$ docker-compose up -d
```

## Launching the App

Serve runs on port 3000 in development mode and port 7000 from the docker-compose. Launch the application with [SMART on FHIR Launcher](https://launch.smarthealthit.org/index.html). Use the App launch URL: http://localhost:3000/launch

## Target CQL file

The app uses the cql file listed in the file `./cql-results/src/data/cql-files.json`.

If you modify any of the CQL files, you must convert the file from CQL to ELM (JSON file) and update the valuse set DB. For example:

```
cql-to-elm --format=JSON --input ./cql-results/src/data/R4/Million_Hearts_Baseline_10_Year_ASCVD_Risk_FHIRv400.cql
```

You need to update the value set DB based on the value sets defined in the CQL file.
From the utils folder type:

```
node updateValuseSetDB.js
```

NOTE: If you change the content of the cql-files.json, the app will automatically process the patient data against the logic of the cql file informed.
