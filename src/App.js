import { useEffect, useState } from 'react';
import './App.css';

function App() {
  let url = `https://api.open-meteo.com/v1/forecast?latitude=30.26715&longitude=-97.74306&hourly=temperature_2m&temperature_unit=fahrenheit`;
  let [data, setData] = useState([]);
  let [input, setInput] = useState();
  let [error, setError] = useState();
  let [city, setCity] = useState("Austin");
  // Added dependency array to ensure no infinite re-rendering.
  useEffect(()=> {
    fetch(url)
    .then(response => response.json())
    .then(response => setData(response))
  }, [url])
  let divs = []
  // Check if data has loaded.
  if (data['hourly'])
  {
    // If it has, generate divs for the day.
    for (let i = 0; i < 24; i++)
    {
      let currTime = data['hourly']['time'][i].slice(-5)
      let currWeather = data['hourly']['temperature_2m'][i]
      divs.push(
      <div key={i} className="w-36 h-2 mt-5 flex"> 
        <div className="w-1/2 flex justify-center items-center"> {currTime} </div> 
        <div className="w-1/2 flex justify-center items-center"> {currWeather}°F </div> 
      </div>)
    }
  }
  async function updateData(fn, location)
  {
    console.log(location)
    let coord = await convertToCoordinates(location);
    if (coord.status !== "Success")
    {
      setError("City could not be found.");
      return;
    }
    setCity(location[0].toUpperCase() + location.slice(1));
    setError();
    let updatedUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coord.latitude}&longitude=${coord.longitude}&hourly=temperature_2m&temperature_unit=fahrenheit`;
    let res = await fetch(updatedUrl);
    res = await res.json();
    fn(res);
  }
  function handleChange(e)
  {
    setInput(e.target.value);
  }
  function checkIfEntered(e)
  {
    if (e.key === "Enter" || e.key === "NumpadEnter")
    {
      updateData(setData, input);
    }
  }
    return (
    <div className="w-full">
      <div className="m-5 flex justify-center items-center flex-col">

        <div className="text-3xl font-semibold"> Current Location: {city} </div>
        <div className="font-semibold text-xl mt-5 mb-5"> Choose A City</div>
        <div>
          <button className="button" onClick={() => {updateData(setData, "Austin")}}>
            Austin
          </button>
          <button className="button" onClick={() => {updateData(setData, "Dallas")}}>
            Dallas
          </button>
          <button className="button" onClick={() => {updateData(setData, "Houston")}}>
            Houston
          </button>
        </div>
        <div className="font-semibold text-xl my-5"> Or Enter Your Own</div>
        <div>
            <input placeholder='Enter city here...' className="rounded-lg p-2 border" onChange={handleChange} onKeyDownCapture={checkIfEntered}/>
            <button className="button" onClick={() => {updateData(setData, input)}}> Go </button>
            <div className="text-red-900"> {error} </div>
        </div>
        
        <div className="w-36 h-10 flex font-semibold mt-1">
            <div className="w-1/2 flex justify-center items-center">Time</div>
            <div className="w-1/2 flex justify-center items-center">Weather</div>
        </div>
        {divs}
      </div>
    </div>
    );
}

async function convertToCoordinates(cityName)
{
  let lat;
  let long;
  let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
  res = await res.json();
  if (!res.results)
  {
    return {status: "Failure"}
  }
  lat = res.results[0].latitude;
  long = res.results[0].longitude;
  console.log(`lat: ${lat}, long: ${long}`)
  return {status: "Success", latitude: lat, longitude: long};
}

export default App;
