import React, {useEffect, useState} from 'react';
import Map from './Map';

function App() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('config.json')
      .then((response) => response.json())
      .then(setConfig)
      .catch(setError);
  }
  , []);

  if (error) {
    console.error(error);
    return <div className="App">{error.message}</div>;
  }

  if (!config) {
    return <div className="App">Loading...</div>;
  }

  return (
    <Map {...config}></Map>
  );
}

export default App;