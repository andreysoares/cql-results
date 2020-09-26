import React from "react";
import JSONTree from "react-json-tree";

const result = (props) => {
  if (props.results) {
    const resultTable = Object.entries(props.results)
      .sort()
      .map((entry) => {
        const key = entry[0];
        const type = typeof entry[1];
        const value =
          type === "undefined"
            ? undefined
            : JSON.parse(JSON.stringify(entry[1]));

        return (
          <tr key={key}>
            <th>{key}</th>
            <td>{type}</td>
            <td>
              <JSONTree
                data={value}
                theme={{ base00: "#272822" }}
                invertTheme={true}
              />
            </td>
          </tr>
        );
      });

    return (
      <div>
        <table className="table table-sm">
          <thead className="thead-light">
            <tr>
              <th>Expression</th>
              <th>Type</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>{resultTable}</tbody>
        </table>
      </div>
    );
  } else {
    return null;
  }
};

export default result;
