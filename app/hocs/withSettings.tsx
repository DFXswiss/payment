import React from "react";
import { Subscription } from "rxjs";
import SettingsService, { AppSettings } from "../services/SettingsService";

interface Props {
  settings?: AppSettings;
}

const withSettings = <T extends object>(WrappedComponent: React.ComponentType<T & Props>) => {
  class WithSettings extends React.Component<T> {
    private subscription?: Subscription = undefined;

    state = {
      settings: undefined,
    };

    componentDidMount = () => {
      this.subscription = SettingsService.Settings$.subscribe((settings) => this.setState({ settings: settings }));
    };

    componentWillUnmount = () => {
      this.subscription?.unsubscribe();
    };

    render() {
      return <WrappedComponent {...this.props} settings={this.state.settings} />;
    }
  }

  return WithSettings;
};

export default withSettings;
