import React, { Component, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackPage?: () => void; // optional: navigate home callback
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    this.props.fallbackPage?.();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, showDetails } = this.state;

    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)' }}>
        <motion.div
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          {/* Icon */}
          <motion.div
            className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AlertTriangle size={28} className="text-red-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-xl font-black text-white mb-2">Oups, une erreur !</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Quelque chose s'est mal passé. Pas de panique, vos données sont en sécurité.
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-black transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }}
            >
              <RefreshCw size={16} />
              Recharger
            </button>

            {this.props.fallbackPage && (
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-transform active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Home size={16} />
                Accueil
              </button>
            )}
          </div>

          {/* Error details toggle */}
          {error && (
            <div>
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-1.5 mx-auto text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                Détails techniques
                <ChevronDown
                  size={12}
                  className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
              </button>

              {showDetails && (
                <motion.div
                  className="mt-3 p-3 rounded-xl text-left overflow-auto max-h-40"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <p className="text-[10px] font-mono text-red-400/80 break-all">
                    {error.name}: {error.message}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
}

export default ErrorBoundary;
