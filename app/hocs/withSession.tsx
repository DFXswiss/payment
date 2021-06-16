import React from "react";
import { Subscription } from "rxjs";
import SessionService, { Session } from "../services/SessionService";

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
      this.subscription = SessionService.Session$.subscribe((session) => this.setState({ session: session }));
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
