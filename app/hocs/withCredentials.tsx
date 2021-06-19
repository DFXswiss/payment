import React from "react";
import { Subscription } from "rxjs";
import AuthService, { Credentials } from "../services/AuthService";

interface Props {
  credentials?: Credentials;
}

const withCredentials = <T extends object>(WrappedComponent: React.ComponentType<T & Props>) => {
  class WithCredentials extends React.Component<T> {
    private subscription?: Subscription = undefined;

    state = {
      credentials: undefined,
    };

    componentDidMount = () => {
      this.subscription = AuthService.Credentials$.subscribe((credentials) => this.setState({ credentials: credentials }));
    };

    componentWillUnmount = () => {
      this.subscription?.unsubscribe();
    };

    render() {
      return <WrappedComponent {...this.props} credentials={this.state.credentials} />;
    }
  }

  return WithCredentials;
};

export default withCredentials;
