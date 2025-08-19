const currentCity = document.querySelector(".city");
const currentIcon = document.querySelector(".info");
const currentSituation = document.querySelector(".current-situation");
const searchBar = document.querySelector(".search-input");
const humidity = document.querySelector(".humidity");
const wind_kph = document.querySelector(".wind_kph");
const pressure_mb = document.querySelector(".pressure_mb");
const sunrise = document.querySelector(".sunrise");
const sunset = document.querySelector(".sunset");
const wind_dir = document.querySelector(".wind_dir");
const date_month = document.querySelector(".date-month");
const week_day = document.querySelector(".week-day");
const my_loader_div=document.querySelector(".my-loader-div");
const main_container=document.querySelector(".container");
const list = document.querySelector(".cities");
const search_loader_div=document.querySelector(".search-loader-div");
const error_message=document.querySelector(".error-message");
let timerId;


const myHeaders = new Headers();
myHeaders.append(`${import.meta.env.VITE_API_KEY_NAME}`, `${import.meta.env.VITE_API_KEY_CITY}`);
myHeaders.append(`${import.meta.env.VITE_API_HOST_NAME}`, `${import.meta.env.VITE_API_HOST_KEY}`);


const api = async (cityName = "Lahore") => {
  console.log(cityName);
  my_loader_div.style.visibility = 'visible';
  const response = await fetch(`${import.meta.env.VITE_BASE_URL}?key=${import.meta.env.VITE_API_KEY}&q=${cityName}&days=7`);

  if(response.status!=200){
    return "not Valid";
  }
  return await response.json();

}


const apiCall = (cityName) => {
  api(cityName).then((data) => {
    console.log(cityName);
    if(data==="not Valid"){
      alert("Invalid City");
      my_loader_div.style.visibility = 'hidden';
      main_container.style.visibility = 'visible';
      return;
    }
    const parent = document.querySelector(".week-details");
    parent.innerHTML = "";
    currentCity.textContent = data?.location?.name;
    currentIcon.src = data?.current?.condition?.icon;
    currentSituation.textContent = data?.current?.condition?.text;
    let temperature = data?.current?.temp_c;
    document.querySelector(".current-temp").textContent = `${temperature}°`;
    let feel = data?.current?.feelslike_c;
    document.querySelector(".feel-like").textContent = `Feel like ${feel}°`;
    humidity.textContent = `${data?.current?.humidity}%`;
    wind_kph.textContent = `${data?.current?.wind_kph}km/h`;
    pressure_mb.textContent = `${data?.current?.pressure_mb} mb`;
    wind_dir.textContent = `${data?.current?.wind_dir}`;
    sunrise.textContent = `Sunrise ${data.forecast?.forecastday[0]?.astro?.sunrise}`;
    sunset.textContent = `Sunset ${data.forecast?.forecastday[0]?.astro?.sunset}`;

    let dateStr = data.forecast?.forecastday[0]?.date;

    if (dateStr) {
      let dateObj = new Date(dateStr);

      let day = dateObj.getDate();
      let month = dateObj.toLocaleString("en-US", { month: "long" });
      let weekday = dateObj.toLocaleString("en-US", { weekday: "long" });

      date_month.textContent = `${month} ${day}`;
      week_day.textContent = `${weekday}`

    }


    let details = document.querySelector(".week-details");
    for (let i = 0; i < 7; i++) {
      let dateStr = data.forecast?.forecastday[i]?.date;
      let dateObj = new Date(dateStr);
      let dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      let temp = data.forecast?.forecastday[i]?.day?.avgtemp_c;

      let newDiv = document.createElement("div");
      newDiv.classList.add("day-name");

      newDiv.innerHTML = `
    <img src="${data.forecast?.forecastday[i]?.day?.condition.icon}" alt="">
    <p>${temp}&deg;</p>
    <p>${dayName}</p>
`;
      details.appendChild(newDiv);
    }
     
      my_loader_div.style.visibility = 'hidden';
      main_container.style.visibility = 'visible';
  });
}


const apiCityFetch= async (cityName)=>{
  let response =await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${cityName}`, {
  method: 'GET',
  headers: myHeaders
  });

  let cities =await response.json();
  return cities;
}

const cityApi = async (cityName)=>{
   
    let cities=await apiCityFetch(cityName);
    let search_filter=document.querySelector(".cities");
    search_loader_div.style.visibility='hidden';
    console.log(cities);

    if(cities?.data.length===0){
      console.log("cities not find");
      return;
      
    }
    list.style.visibility='visible';
   
    for (let i = 0; i < cities?.data.length; i++){
      
      let newLi = document.createElement("li");

      let city=cities?.data[i]?.city;
      console.log(city);
      newLi.innerHTML=`${city}`;

      search_filter.appendChild(newLi);
    }

  let curcity=  await cityWait();
  return curcity;
}

const cityWait = () => {
  return new Promise((resolve) => {
    list.addEventListener("click",(event) => {
        if (event.target.tagName === "LI") {
          let selectedCity = event.target.textContent.trim();
          console.log("Selected:", selectedCity);
          
          resolve(selectedCity);
        }
      }
    );
  });

};

apiCall();



searchBar.addEventListener("keydown",async (event) => {
  let cityName;
  search_loader_div.style.visibility='visible';
  error_message.style.visibility='hidden';
  list.style.visibility='hidden';

  clearTimeout(timerId);
  
  if (event.key === "Enter") {
    const value = event.target.value;
    console.log(value);

    if(value.length<3){
      console.log("not valid");
      search_loader_div.style.visibility='hidden';
      error_message.style.visibility='visible';
      setTimeout(()=>{
        error_message.style.visibility='hidden';
      },2000);
      return;
    }
    
    if (value===""){
      cityName=undefined;
    }else{
      cityName = value;
    }
    
    loadapi(cityName);

    return;
   
  }
  timerId =setTimeout(()=>{
    list.innerHTML = "";
    const value = event.target.value;
    
    console.log(value);

    if(value.length<3){
      console.log("not valid");
      search_loader_div.style.visibility='hidden';
      error_message.style.visibility='visible';
      setTimeout(()=>{
        error_message.style.visibility='hidden';
      },2000);
      return;
    }
    
    if (value===""){
      cityName=undefined;
    }else{
      cityName = value;
    }
    
    loadapi(cityName);
   

  },3000);

 
});


const loadapi =async (cityName)=>{
  console.log(cityName);
    let cityNew= await cityApi(cityName);
    list.innerHTML = "";
    if(cityNew===undefined){
      alert("city not found");
      console.log("new city not find");
      searchBar.value = "";
      return ;
    }
    list.style.visibility='hidden';
    
    console.log(cityNew);
    apiCall(cityNew);
    searchBar.value = "";

    
}

