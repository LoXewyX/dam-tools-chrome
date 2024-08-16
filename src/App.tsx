import { Suspense } from 'preact/compat';

import Loading from './templates/Loading';
import Home from './components/Home';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}

export default App;
