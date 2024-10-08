import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log('Error caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-page">
                    <div className="error-content">
                        <img src="/logo.png" alt="GEOPREDICT" className="error-logo" />
                        <h1>Houston, we have a problem!</h1>
                        <p>It seems our spacecraft has encountered some unexpected space debris.</p>
                        <p>Shall we attempt a <button onClick={() => window.location.reload()}>relaunch</button>?</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;