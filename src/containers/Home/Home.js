import React, { Component } from "react";
import FHIR from "fhirclient";
import Spinner from "../../elements/Spinner";
import NavBar from "../../elements/NavBar";

import CQL from "../../components/cql/cql";
import Result from "../../components/Result/Result";
import { CQLlibrary } from "../../data/cql-files.json";

class Home extends Component {
  state = {
    patient: null,
    resources: null,
    error: null,
  };

  componentDidMount() {
    let client;
    FHIR.oauth2
      .ready()
      .then((FHIRclient) => {
        client = FHIRclient;
      })
      .then(() => client.patient.read())
      .then((patient) => {
        let entries = [];

        const getResourceEntries = (nextPage) => {
          return client
            .request(nextPage)
            .then((resource) => {
              entries = entries.concat(resource.entry);
              checkNextUrl(resource.link);
            })
            .catch(console.error);
        };

        const checkNextUrl = (link) => {
          if (typeof link !== "undefined" && link.length > 0) {
            const nextUrl = link.filter((e) => {
              return e.relation === "next";
            });

            if (nextUrl.length > 0) {
              getResourceEntries(nextUrl[0].url);
            } else {
              var resources = {
                resourceType: "Bundle",
                id: "bundle-" + patient.id,
                type: "collection",
                entry: entries,
              };

              this.setState({ resources, patient });
            }
          }
        };

        client
          .request(`Patient/${patient.id}/$everything?_count=1000`)
          .then((resource) => {
            entries = entries.concat(resource.entry);
            checkNextUrl(resource.link);
          })
          .catch(console.error);
      })
      .catch((error) => this.setState({ error }));
  }

  render() {
    var ret = null;

    if (this.state.error) {
      ret = (
        <div>
          <NavBar library={CQLlibrary} />
          <pre>{this.state.error.message}</pre>
        </div>
      );
    } else if (this.state.resources) {
      const cql = CQL(this.state.resources);

      ret = (
        <div>
          <NavBar library={CQLlibrary} />
          <div className="container-fluid">
            <Result
              total={this.state.resources.entry.length}
              results={cql}
              patient={this.state.patient}
            />
          </div>
        </div>
      );
    } else
      ret = (
        <div>
          <NavBar library={CQLlibrary} />
          <Spinner />
        </div>
      );

    return ret;
  }
}

export default Home;
