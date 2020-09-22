import React, { Component } from "react";
import FHIR from "fhirclient";
import Spinner from "../../elements/Spinner";

class Launch extends Component {
  state = {};

  componentDidMount() {
    const params = {
      client_id: "client_id",
      scope: "launch/patient patient/Patient.read openid fhirUser",
      redirect_uri: "/app",
      completeInTarget: true,
    };

    FHIR.oauth2.authorize(params);
  }

  render() {
    return <Spinner />;
  }
}

export default Launch;
