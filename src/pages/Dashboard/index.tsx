import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Alert, PageSection, PageSectionVariants } from "@patternfly/react-core";
import {
  LoadingComponent
} from "../../components/index";
type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI Demo site";
  }

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <PageSection variant={PageSectionVariants.darker}>
          <h1>Hippocampal Volume</h1>
        </PageSection>
        <PageSection>
          <div>
            <LoadingComponent />
            <h1 className="pf-u-mb-md">Welcome to ChRIS UI Demo site's Dashboard</h1>
            <Alert
              aria-label="welcome wagon"
              variant="info"
              title="Welcome!"  >
              Welcome to ChRIS UI Demo site's Dashboard
        </Alert>
          </div>
          {children}
        </PageSection>
      </React.Fragment>

    );
  }
}

export { DashboardPage as Dashboard };
