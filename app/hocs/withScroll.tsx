import React from "react";
import { Subscription } from "rxjs";
import ScrollService from "../services/ScrollService";

interface Props {
  scrollPosition?: number;
}

const withScroll = <T extends object>(WrappedComponent: React.ComponentType<T & Props>) => {
  class WithScroll extends React.Component<T> {
    private subscription?: Subscription = undefined;

    state = {
      scrollPosition: Infinity,
    };

    componentDidMount = () => {
      this.subscription = ScrollService.ScrollPosition$.subscribe((scroll) => this.setState({ scrollPosition: scroll }));
    };

    componentWillUnmount = () => {
      this.subscription?.unsubscribe();
    };

    render() {
      return <WrappedComponent {...this.props} scrollPosition={this.state.scrollPosition} />;
    }
  }

  return WithScroll;
};

export default withScroll;
