import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">页面渲染出错</h1>
            <p className="text-muted-foreground">请刷新页面重试。</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
