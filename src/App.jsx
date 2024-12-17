import { ArticleProvider } from './contexts/ArticleContext';

export default function App() {
  return (
    <ArticleProvider>
      <div className="app">
        <Navigation />
        <TabContent />
      </div>
    </ArticleProvider>
  );
}