import React from "react";
import { Subscription } from "rxjs";
import AuthService, { Session } from "../services/AuthService";

interface Props {
  session?: Session;
}

const withSession = <T extends object>(WrappedComponent: React.ComponentType<T & Props>) => {
  class WithSession extends React.Component<T> {
    private subscription?: Subscription = undefined;

    state = {
      session: undefined,
    };

    componentDidMount = () => {
      this.subscription = AuthService.Session$.subscribe((session) => this.setState({ session: session }));
    };

    componentWillUnmount = () => {
      this.subscription?.unsubscribe();
    };

    render() {
      return <WrappedComponent {...this.props} session={this.state.session} />;
    }
  }

  return WithSession;
};

export default withSession;
