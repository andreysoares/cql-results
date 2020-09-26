import React, { Component } from "react";
import FHIR from "fhirclient";
import Spinner from "../../elements/Spinner";
import Header from "../../components/Header/Header";

import CQL from "../../components/cql/cql";
import Result from "../../components/Result/Result";

class Home extends Component {
  state = {
    patient: null,
    resources: null,
    cql: null,
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
        this.setState({ patient });
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

              this.setState({ resources });

              CQL(resources)
                .then((cql) => {
                  this.setState({ cql });
                })
                .catch(console.error);
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
    const total = this.state.resources
      ? this.state.resources.entry.length
      : null;
    const patient = this.state.patient;
    const cql = this.state.cql;

    if (this.state.error) {
      ret = <pre>{this.state.error.message}</pre>;
    } else if (cql) {
      ret = (
        <div className="container-fluid">
          <Result results={cql} />
        </div>
      );
    } else ret = <Spinner />;

    return (
      <div>
        <Header total={total} patient={patient} />
        {ret}
      </div>
    );
  }
}

export default Home;
